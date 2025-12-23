import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import NodeCache from 'node-cache';
import soap from 'soap';

dotenv.config();

const WSDL_URL = 'http://delivery.colissimo.com.tn/wsColissimoGo/wsColissimoGo.asmx?wsdl';
const PORT = process.env.PORT || 3001;
const CACHE_TTL_SECONDS = 120;

const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS });

const app = express();
app.use(cors());

const getEnvCredentials = () => {
  const user = process.env.COLISSIMO_USER;
  const pass = process.env.COLISSIMO_PASS;
  if (!user || !pass) {
    const missing = [!user && 'COLISSIMO_USER', !pass && 'COLISSIMO_PASS'].filter(Boolean).join(', ');
    const error = new Error(`Missing environment variables: ${missing}`);
    error.statusCode = 500;
    throw error;
  }
  return { user, pass };
};

const pickValue = (raw, keys) => {
  for (const key of keys) {
    if (raw && raw[key] !== undefined && raw[key] !== null) {
      return raw[key];
    }
  }
  return '';
};

const normalizeItem = (raw) => {
  const code = pickValue(raw, ['CODE', 'Code', 'code']);
  const etat = pickValue(raw, ['ETAT', 'Etat', 'etat', 'STATUT', 'Statut']);
  const client = pickValue(raw, ['CLIENT', 'Client', 'client', 'DESTINATAIRE', 'Destinataire']);
  const tel = pickValue(raw, ['TEL', 'Tel', 'tel', 'TELEPHONE', 'Telephone']);
  const adresse = pickValue(raw, ['ADRESSE', 'Adresse', 'adresse']);
  const montant = pickValue(raw, ['MONTANT', 'Montant', 'montant', 'PRIX', 'Prix']);
  const poids = pickValue(raw, ['POIDS', 'Poids', 'poids']);

  const knownKeys = new Set([
    'CODE', 'Code', 'code',
    'ETAT', 'Etat', 'etat', 'STATUT', 'Statut',
    'CLIENT', 'Client', 'client', 'DESTINATAIRE', 'Destinataire',
    'TEL', 'Tel', 'tel', 'TELEPHONE', 'Telephone',
    'ADRESSE', 'Adresse', 'adresse',
    'MONTANT', 'Montant', 'montant', 'PRIX', 'Prix',
    'POIDS', 'Poids', 'poids'
  ]);

  const extra = {};
  if (raw && typeof raw === 'object') {
    Object.entries(raw).forEach(([key, value]) => {
      if (!knownKeys.has(key)) {
        extra[key] = value;
      }
    });
  }

  return {
    code,
    etat,
    client,
    tel,
    adresse,
    montant,
    poids,
    extra
  };
};

const findItemsArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object') {
    for (const value of Object.values(data)) {
      const found = findItemsArray(value);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

const createSoapClient = async () => {
  const { user, pass } = getEnvCredentials();
  const client = await soap.createClientAsync(WSDL_URL);
  client.addSoapHeader({
    AuthHeader: {
      Uilisateur: user,
      Pass: pass
    }
  });
  return client;
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/colis', async (req, res) => {
  const pageNumber = Number.parseInt(req.query.page, 10) || 1;
  if (pageNumber < 1) {
    return res.status(400).json({ message: 'Page number must be 1 or greater.' });
  }

  const cacheKey = `colis-page-${pageNumber}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const client = await createSoapClient();
    const [result] = await client.ListeColisAsync({ pageNumber });
    const itemsArray = findItemsArray(result) || [];
    const normalizedItems = itemsArray.map(normalizeItem);

    const payload = {
      page: pageNumber,
      pageSize: 100,
      items: normalizedItems
    };

    cache.set(cacheKey, payload);
    return res.json(payload);
  } catch (error) {
    const message = error?.message || 'Failed to fetch Colissimo orders.';
    const statusCode = error?.statusCode
      || (message.toLowerCase().includes('auth') ? 401 : 500);

    return res.status(statusCode).json({ message });
  }
});

app.listen(PORT, () => {
  console.log(`Colissimo API server running on port ${PORT}`);
});
