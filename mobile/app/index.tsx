import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { computeRoute, searchPlaces } from '../src/api';
import { addObstacle } from '../src/obstacles';
import { PROFILE_LABELS, PROFILES } from '../src/profiles';
import { AccessibilitySettings, Coordinate, RouteResult, SearchResult } from '../src/types';

const LA_ROCHE = {latitude: 46.0667, longitude: 6.3125};
const OSM_HTML = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><style>html,body,#map{height:100%;margin:0} .leaflet-control-attribution{font-size:9px}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>const map=L.map('map').setView([46.0667,6.3125],15);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);let routeLayer=null;window.setRoute=(coords)=>{if(routeLayer)map.removeLayer(routeLayer);if(coords?.length){routeLayer=L.polyline(coords,{color:'#147D64',weight:7}).addTo(map);map.fitBounds(routeLayer.getBounds(),{padding:[40,40]});}};</script></body></html>`;

export default function Home() {
  const map = useRef<WebView>(null);
  const [position, setPosition] = useState<Coordinate>(LA_ROCHE);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [destination, setDestination] = useState<SearchResult>();
  const [settings, setSettings] = useState<AccessibilitySettings>(PROFILES.manual);
  const [route, setRoute] = useState<RouteResult>();
  const [busy, setBusy] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => { void locate(); }, []);

  async function locate() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return;
    const current = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Balanced});
    const coordinate = {latitude: current.coords.latitude, longitude: current.coords.longitude};
    setPosition(coordinate);
  }

  async function runSearch() {
    if (query.trim().length < 3) return;
    try { setBusy(true); setResults(await searchPlaces(query.trim(), position)); }
    catch { Alert.alert('Recherche indisponible', 'Vérifiez la connexion au serveur LibreVoie.'); }
    finally { setBusy(false); }
  }

  async function runRoute(target = destination, routeSettings = settings) {
    if (!target) return;
    try {
      setBusy(true); setResults([]);
      const next = await computeRoute(position, target.coordinate, routeSettings);
      setRoute(next);
      map.current?.injectJavaScript(`window.setRoute(${JSON.stringify(next.geometry.map(p => [p.latitude, p.longitude]))}); true;`);
    } catch { Alert.alert('Itinéraire indisponible', "Aucun chemin adapté n'a pu être calculé."); }
    finally { setBusy(false); }
  }

  async function reportObstacle() {
    await addObstacle({id: String(Date.now()), coordinate: position, kind: 'blocked_sidewalk', createdAt: new Date().toISOString()});
    Alert.alert('Signalement enregistré', "Dans ce MVP, il est conservé sur l'appareil. La synchronisation collective viendra à l'étape suivante.");
  }

  const confidence = route?.confidence === 'high' ? 'Confiance élevée' : route?.confidence === 'medium' ? 'Confiance moyenne' : 'Données insuffisantes';

  return <SafeAreaView style={styles.safe}>
    <WebView ref={map} style={StyleSheet.absoluteFill} originWhitelist={['*']} source={{html: OSM_HTML}} javaScriptEnabled domStorageEnabled />
    <Text style={styles.attribution}>© OpenStreetMap contributors</Text>

    <View style={styles.topCard}>
      <View style={styles.brand}><View style={styles.logo}><MaterialCommunityIcons name="wheelchair-accessibility" size={23} color="white" /></View><Text style={styles.title}>LibreVoie</Text></View>
      <View style={styles.searchRow}>
        <TextInput value={query} onChangeText={setQuery} onSubmitEditing={runSearch} placeholder="Où souhaitez-vous aller ?" returnKeyType="search" style={styles.input} />
        <Pressable accessibilityLabel="Rechercher" onPress={runSearch} style={styles.iconButton}><MaterialCommunityIcons name="magnify" size={24} color="white" /></Pressable>
      </View>
      <Pressable onPress={() => setSettingsOpen(true)} style={styles.profile}><MaterialCommunityIcons name="tune-variant" size={18} color="#147D64" /><Text style={styles.profileText}>{PROFILE_LABELS[settings.profile]} · pente ≤ {settings.maxIncline} %</Text></Pressable>
      {results.map(item => <Pressable key={item.id} style={styles.result} onPress={() => {setDestination(item); setQuery(item.label); void runRoute(item);}}><MaterialCommunityIcons name="map-marker-outline" size={20} color="#5A2D82" /><Text numberOfLines={2} style={styles.resultText}>{item.label}</Text></Pressable>)}
    </View>

    {busy && <View style={styles.loader}><ActivityIndicator color="#147D64" /></View>}
    <View style={styles.mapButtons}>
      <Pressable onPress={locate} style={styles.round}><MaterialCommunityIcons name="crosshairs-gps" size={25} color="#147D64" /></Pressable>
      <Pressable onPress={reportObstacle} style={[styles.round, styles.warning]}><MaterialCommunityIcons name="alert-plus-outline" size={25} color="#A64B00" /></Pressable>
    </View>

    {route && <View style={styles.routeCard}>
      <View style={styles.routeHeader}><Text style={styles.routeTime}>{Math.ceil(route.durationSeconds / 60)} min</Text><Text style={styles.routeDistance}>{(route.distanceMeters / 1000).toFixed(1)} km</Text></View>
      <Text style={[styles.confidence, route.confidence === 'low' && styles.low]}>{confidence} · {route.unknownSegmentsPercent}% non documenté</Text>
      {route.warnings.slice(0, 2).map(w => <Text key={w} style={styles.warningText}>• {w}</Text>)}
      <Text style={styles.disclaimer}>Le trajet dépend de la qualité des données disponibles. Restez attentif aux conditions réelles.</Text>
    </View>}

    <Modal visible={settingsOpen} transparent animationType="slide" onRequestClose={() => setSettingsOpen(false)}>
      <Pressable style={styles.backdrop} onPress={() => setSettingsOpen(false)} />
      <View style={styles.sheet}><Text style={styles.sheetTitle}>Mon profil de mobilité</Text><ScrollView>
        {(Object.keys(PROFILES) as Array<keyof typeof PROFILES>).map(key => <Pressable key={key} onPress={() => {const nextSettings = PROFILES[key]; setSettings(nextSettings); setSettingsOpen(false); if (destination) void runRoute(destination, nextSettings);}} style={[styles.profileChoice, settings.profile === key && styles.selected]}>
          <Text style={styles.choiceTitle}>{PROFILE_LABELS[key]}</Text><Text style={styles.choiceDetail}>Pente {PROFILES[key].maxIncline}% · ressaut {PROFILES[key].maxKerbCm} cm · largeur {PROFILES[key].minWidthCm} cm</Text>
        </Pressable>)}
      </ScrollView></View>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe:{flex:1}, attribution:{position:'absolute',right:5,bottom:2,fontSize:10,color:'#3F4C47',backgroundColor:'rgba(255,255,255,.8)'}, topCard:{position:'absolute',top:48,left:14,right:14,backgroundColor:'white',borderRadius:20,padding:14,elevation:6}, brand:{flexDirection:'row',alignItems:'center',marginBottom:10},logo:{width:36,height:36,borderRadius:12,backgroundColor:'#147D64',alignItems:'center',justifyContent:'center'},title:{fontSize:22,fontWeight:'800',color:'#1F2933',marginLeft:10},searchRow:{flexDirection:'row',gap:8},input:{flex:1,backgroundColor:'#F1F5F3',borderRadius:13,paddingHorizontal:14,fontSize:16,height:48},iconButton:{width:48,height:48,borderRadius:13,backgroundColor:'#147D64',alignItems:'center',justifyContent:'center'},profile:{flexDirection:'row',gap:7,alignItems:'center',marginTop:10},profileText:{color:'#147D64',fontWeight:'700'},result:{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:11,borderTopWidth:1,borderTopColor:'#E8ECEA'},resultText:{flex:1,color:'#27332F'},loader:{position:'absolute',top:'46%',left:'46%',backgroundColor:'white',padding:15,borderRadius:30,elevation:4},mapButtons:{position:'absolute',right:16,bottom:220,gap:10},round:{width:50,height:50,borderRadius:25,backgroundColor:'white',alignItems:'center',justifyContent:'center',elevation:4},warning:{backgroundColor:'#FFF3E5'},routeCard:{position:'absolute',left:14,right:14,bottom:18,backgroundColor:'white',borderRadius:20,padding:16,elevation:7},routeHeader:{flexDirection:'row',alignItems:'baseline',gap:10},routeTime:{fontSize:27,fontWeight:'800',color:'#147D64'},routeDistance:{fontSize:16,color:'#52615C'},confidence:{fontWeight:'700',color:'#147D64',marginTop:5},low:{color:'#A64B00'},warningText:{color:'#5A4030',marginTop:5},disclaimer:{fontSize:12,color:'#68756F',marginTop:9},backdrop:{flex:1,backgroundColor:'rgba(0,0,0,.3)'},sheet:{backgroundColor:'white',padding:20,paddingBottom:38,borderTopLeftRadius:24,borderTopRightRadius:24,maxHeight:'58%'},sheetTitle:{fontSize:22,fontWeight:'800',marginBottom:14},profileChoice:{padding:15,borderRadius:14,backgroundColor:'#F1F5F3',marginBottom:10,borderWidth:2,borderColor:'transparent'},selected:{borderColor:'#147D64',backgroundColor:'#E8F4EF'},choiceTitle:{fontSize:17,fontWeight:'700'},choiceDetail:{color:'#52615C',marginTop:4}
});
