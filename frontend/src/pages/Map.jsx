import React, { useEffect, useRef } from 'react';
import SitemarkIcon from '../components/SitemarkIcon';
import 'leaflet/dist/leaflet.css';

export default function Map(props) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    import('leaflet').then((module) => {
      if (!mounted) return;
      const L = module && module.default ? module.default : module;

      console.log('Leaflet dynamic import:', L, 'has map:', typeof L.map === 'function');

      const map = L.map(mapContainerRef.current).setView([42.42, 23.19], 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      leafletMapRef.current = map;
    });

    return () => {
      mounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  return (
    <Container id="features" sx={{ pt: { xs: 12, sm: 12 } }}>
      <Box sx={{ width: { sm: '100%', md: '60%' } }}>
        <Typography component="h2" variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
          Map
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}>
          Provide a brief overview of the key features of the product. For example,
          you could list the number of features, their types or benefits, and
          add-ons.
        </Typography>
      </Box>

      <Box sx={{ height: 400, width: '100%', mt: 2 }}>
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
      </Box>
    </Container>
  );
}
