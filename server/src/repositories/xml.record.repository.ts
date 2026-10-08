import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import { Record } from '../models/record.model';
import { IRecordRepository } from './repository.interface';

const DATA_PATH = path.join(__dirname, '..', 'seed', 'data.xml');

interface XmlRecord {
  $: {
    id: string;
    userId: string;
    title: string;
    description: string;
    accessLevel: string;
    status: string;
    createdAt: string;
  };
}

interface XmlData {
  data: {
    users: unknown[];
    records: Array<{ record: XmlRecord[] }>;
  };
}

function xmlRecordToRecord(xr: XmlRecord): Record {
  return {
    recordId: xr.$.id,
    userId: xr.$.userId,
    title: xr.$.title,
    description: xr.$.description,
    accessLevel: xr.$.accessLevel as Record['accessLevel'],
    status: xr.$.status as Record['status'],
    createdAt: xr.$.createdAt,
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
      .filter((r) => r.userId === userId);
  }

  async findAll(): Promise<Record[]> {
    const data = await readXml();
    const records = data.data.records[0]?.record || [];
    return records.map(xmlRecordToRecord);
  }
}
