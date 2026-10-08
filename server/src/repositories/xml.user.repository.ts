import fs from 'fs';
import path from 'path';
import { parseStringPromise, Builder } from 'xml2js';
import { User } from '../models/user.model';
import { IUserRepository } from './repository.interface';

const DATA_PATH = path.join(__dirname, '..', 'seed', 'data.xml');

interface XmlUser {
  $: {
    id: string;
    password: string;
    role: string;
    fullName: string;
    email: string;
    department: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface XmlData {
  data: {
    users: Array<{ user: XmlUser[] }>;
    records: unknown[];
  };
}

function xmlUserToUser(xu: XmlUser): User {
  return {
    userId: xu.$.id,
    passwordHash: xu.$.password,
    role: xu.$.role as User['role'],
    fullName: xu.$.fullName,
    email: xu.$.email,
    department: xu.$.department,
    status: xu.$.status as User['status'],
    createdAt: xu.$.createdAt,
    updatedAt: xu.$.updatedAt,
  };
}

function userToXmlAttrs(user: User): XmlUser['$'] {
  return {
    id: user.userId,
    password: user.passwordHash,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    department: user.department,
    status: user.status,
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
    const found = users.find((u) => u.$.id === userId);
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
    const index = users.findIndex((u) => u.$.id === userId);
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
    const index = users.findIndex((u) => u.$.id === userId);
    if (index === -1) return false;

    users.splice(index, 1);
    writeXml(data);
    return true;
  }
}
