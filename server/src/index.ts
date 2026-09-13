import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { z } from 'zod';
import { confidenceFromExtraInfo, orsOptions } from './accessibility.js';

const app = express();
app.use(cors());
app.use(express.json({limit:'100kb'}));

const coordinate = z.object({latitude:z.number().min(-90).max(90),longitude:z.number().min(-180).max(180)});
const routeRequest = z.object({
  start: coordinate,
  end: coordinate,
  settings: z.object({profile:z.enum(['manual','electric','reduced']),maxIncline:z.union([z.literal(3),z.literal(6),z.literal(10),z.literal(15)]),maxKerbCm:z.union([z.literal(3),z.literal(6),z.literal(10)]),minWidthCm:z.number().min(50).max(250),avoidPoorSurface:z.boolean()}),
});

app.get('/health', (_req,res) => res.json({ok:true}));

app.get('/api/search', async (req,res) => {
  const query = z.string().min(3).max(120).safeParse(req.query.q);
  if (!query.success) return res.status(400).send('Recherche trop courte');
  const endpoint = process.env.NOMINATIM_URL ?? 'https://nominatim.openstreetmap.org';
  const params = new URLSearchParams({q:query.data,format:'jsonv2',limit:'6',countrycodes:'fr',addressdetails:'1'});
  if (req.query.lat && req.query.lon) params.set('viewbox', `${Number(req.query.lon)-.15},${Number(req.query.lat)+.1},${Number(req.query.lon)+.15},${Number(req.query.lat)-.1}`);
  const response = await fetch(`${endpoint}/search?${params}`, {headers:{'User-Agent':'LibreVoie/0.1 contact@larochesurforon.fr','Accept-Language':'fr'}});
  if (!response.ok) return res.status(502).send('Géocodage indisponible');
  const data = await response.json() as Array<{place_id:number;display_name:string;lat:string;lon:string}>;
  res.json(data.map(x => ({id:String(x.place_id),label:x.display_name,coordinate:{latitude:Number(x.lat),longitude:Number(x.lon)}})));
});

app.post('/api/route', async (req,res) => {
  const parsed = routeRequest.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({error:'Paramètres invalides',details:parsed.error.flatten()});
  if (!process.env.ORS_API_KEY) return res.status(503).send('ORS_API_KEY non configurée');
  const {start,end,settings} = parsed.data;
  const response = await fetch('https://api.openrouteservice.org/v2/directions/wheelchair/geojson', {
    method:'POST',
    headers:{Authorization:process.env.ORS_API_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({coordinates:[[start.longitude,start.latitude],[end.longitude,end.latitude]],instructions:true,extra_info:['surface','waytype','steepness'],options:orsOptions(settings)}),
  });
  if (!response.ok) return res.status(response.status === 404 ? 404 : 502).send(await response.text());
  const data = await response.json() as any;
  const feature = data.features?.[0];
  if (!feature) return res.status(404).send('Aucun itinéraire trouvé');
  const summary = feature.properties.summary;
  const confidence = confidenceFromExtraInfo(feature.properties.extras ? Object.keys(feature.properties.extras) : undefined);
  const warnings = [
    ...(confidence.confidence === 'low' ? ["Une part importante du trajet n'est pas documentée dans OpenStreetMap."] : []),
    ...(settings.profile === 'manual' ? ['La pente peut fortement modifier la difficulté réelle en fauteuil manuel.'] : []),
  ];
  res.json({
    geometry: feature.geometry.coordinates.map(([longitude,latitude]:[number,number]) => ({latitude,longitude})),
    distanceMeters: summary.distance,
    durationSeconds: summary.duration,
    ...confidence,
    warnings,
  });
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`LibreVoie API listening on ${port}`));
