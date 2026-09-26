import { Client, Account, ID, Databases, Storage } from 'appwrite';

const ProjectID = "<PROJECT_ID>" || undefined
const EndPoint = "<PROJECT_END_POIND>" || undefined
const DatabaseID = "<DATABASE_ID>" || undefined
const BucketID = "<BUCKET_ID>" || undefined

const client = new Client();

client
    .setEndpoint(EndPoint)
    .setProject(ProjectID)
    .setKey('<YOUR_API_KEY>');  

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

const sessionClient = new Client()
    .setEndpoint(EndPoint) 
    .setProject(ProjectID);  

export {
    ID,
    ProjectID,
    DatabaseID,
    BucketID,
    account as Account,
    databases as Database,
    storage as Storage,
    sessionClient as ServerSession
}
