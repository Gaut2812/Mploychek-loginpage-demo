import fs from 'fs';
import path from 'path';
import { parseStringPromise, Builder } from 'xml2js';
import { User, normalizeRole } from '../models/user.model';
import { IUserRepository } from './repository.interface';

const DATA_PATH = path.join(__dirname, '..', 'seed', 'data.xml');

interface XmlUser {
  $: {
    id?: string;
    userId?: string;
    password?: string;
    passwordHash?: string;
    role?: string;
    name?: string;
    fullName?: string;
    email?: string;
    department?: string;
    status?: string;
    memberSince?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

interface XmlData {
  data: {
    users: Array<{ user: XmlUser[] }>;
    records: unknown[];
  };
}

function xmlUserToUser(xu: XmlUser): User {
  const attrs = xu.$;
  const uid = attrs.id || attrs.userId || '';
  const dName = attrs.name || attrs.fullName || uid;
  const created = attrs.memberSince || attrs.createdAt || new Date().toISOString();

  return {
    id: uid,
    userId: uid,
    name: dName,
    fullName: dName,
    email: attrs.email || '',
    passwordHash: attrs.password || attrs.passwordHash || '',
    role: normalizeRole(attrs.role || 'General User'),
    department: attrs.department || 'General',
    status: (attrs.status || 'Active') as User['status'],
    memberSince: created,
    createdAt: attrs.createdAt || created,
    updatedAt: attrs.updatedAt || created,
  };
}

function userToXmlAttrs(user: User): XmlUser['$'] {
  return {
    id: user.userId,
    userId: user.userId,
    password: user.passwordHash,
    role: normalizeRole(user.role),
    name: user.name || user.fullName,
    fullName: user.fullName || user.name,
    email: user.email,
    department: user.department,
    status: user.status || 'Active',
    memberSince: user.memberSince || user.createdAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function readXml(): Promise<XmlData> {
  const xml = fs.readFileSync(DATA_PATH, 'utf-8');
  return parseStringPromise(xml) as Promise<XmlData>;
}

function writeXml(data: XmlData): void {
  const builder = new Builder();
  const xml = builder.buildObject(data);
  fs.writeFileSync(DATA_PATH, xml, 'utf-8');
}

export class XmlUserRepository implements IUserRepository {
  async findById(userId: string): Promise<User | null> {
    const data = await readXml();
    const users = data.data.users[0]?.user || [];
    const found = users.find((u) => (u.$.id || u.$.userId) === userId);
    return found ? xmlUserToUser(found) : null;
  }

  async findAll(): Promise<User[]> {
    const data = await readXml();
    const users = data.data.users[0]?.user || [];
    return users.map(xmlUserToUser);
  }

  async create(user: User): Promise<User> {
    const data = await readXml();
    if (!data.data.users[0]) {
      data.data.users[0] = { user: [] };
    }
    if (!data.data.users[0].user) {
      data.data.users[0].user = [];
    }
    data.data.users[0].user.push({ $: userToXmlAttrs(user) });
    writeXml(data);
    return user;
  }

  async update(userId: string, updates: Partial<User>): Promise<User | null> {
    const data = await readXml();
    const users = data.data.users[0]?.user || [];
    const index = users.findIndex((u) => (u.$.id || u.$.userId) === userId);
    if (index === -1) return null;

    const existing = xmlUserToUser(users[index]);
    const updated: User = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    users[index] = { $: userToXmlAttrs(updated) };
    writeXml(data);
    return updated;
  }

  async delete(userId: string): Promise<boolean> {
    const data = await readXml();
    const users = data.data.users[0]?.user || [];
    const index = users.findIndex((u) => (u.$.id || u.$.userId) === userId);
    if (index === -1) return false;

    users.splice(index, 1);
    writeXml(data);
    return true;
  }
}
