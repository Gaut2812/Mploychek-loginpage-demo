import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import { Record } from '../models/record.model';
import { IRecordRepository } from './repository.interface';

const DATA_PATH = path.join(__dirname, '..', 'seed', 'data.xml');

interface XmlRecord {
  $: {
    id?: string;
    recordId?: string;
    userId?: string;
    ownerUserId?: string;
    title?: string;
    description?: string;
    accessLevel?: string;
    status?: string;
    createdAt?: string;
    createdDate?: string;
  };
}

interface XmlData {
  data: {
    users: unknown[];
    records: Array<{ record: XmlRecord[] }>;
  };
}

function xmlRecordToRecord(xr: XmlRecord): Record {
  const attrs = xr.$;
  const recordId = attrs.recordId || attrs.id || '';
  const owner = attrs.ownerUserId || attrs.userId || '';
  const created = attrs.createdDate || attrs.createdAt || new Date().toISOString();

  return {
    recordId,
    title: attrs.title || '',
    description: attrs.description || '',
    ownerUserId: owner,
    userId: owner,
    accessLevel: attrs.accessLevel || 'READ',
    status: attrs.status || 'Active',
    createdDate: created,
    createdAt: created,
  };
}

async function readXml(): Promise<XmlData> {
  const xml = fs.readFileSync(DATA_PATH, 'utf-8');
  return parseStringPromise(xml) as Promise<XmlData>;
}

export class XmlRecordRepository implements IRecordRepository {
  async findByUserId(userId: string): Promise<Record[]> {
    const data = await readXml();
    const records = data.data.records[0]?.record || [];
    return records
      .map(xmlRecordToRecord)
      .filter((r) => r.ownerUserId === userId || r.userId === userId);
  }

  async findAll(): Promise<Record[]> {
    const data = await readXml();
    const records = data.data.records[0]?.record || [];
    return records.map(xmlRecordToRecord);
  }
}
