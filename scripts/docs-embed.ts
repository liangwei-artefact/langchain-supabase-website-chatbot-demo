import { Document } from 'langchain/document';
import * as fs from 'fs/promises';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Embeddings, OpenAIEmbeddings } from 'langchain/embeddings';
import { SupabaseVectorStore } from 'langchain/vectorstores';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { supabaseClient } from '@/utils/supabase-client';
import { folderPath } from '@/config/notionurls';
import { TextLoader } from "langchain/document_loaders";

async function extractDataFromFolder(folderPath: string):Promise<Document[]>{
    const files = await fs.readdir(folderPath);
    const documents: Document[] = [];
    for (const file of files) {
        // const data = await fs.readFile(`${folderPath}/${file}`, 'utf-8');
        const loader = new TextLoader(`${folderPath}/${file}`);
        const docs = await loader.load();
        documents.push(...docs);
    }
    console.log('data extracted from folderPath');
    const json = JSON.stringify(documents);
    await fs.writeFile('franknotion.json', json);
    console.log('json file containing data saved on disk');
    return documents;
}

async function splitDocsIntoChunks(docs: Document[]): Promise<Document[]> {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });
    return await textSplitter.splitDocuments(docs);
  }

  async function embedDocuments(
    client: SupabaseClient,
    docs: Document[],
    embeddings: Embeddings,
  ) {
    console.log('creating embeddings...');
    await SupabaseVectorStore.fromDocuments(client, docs, embeddings);
    console.log('embeddings successfully stored in supabase');
  }

(async function run(path: string) {
    try {
      const rawDocs = await extractDataFromFolder(path);
      //split docs into chunks for openai context window
      const docs = await splitDocsIntoChunks(rawDocs);
      //embed docs into supabase
      await embedDocuments(supabaseClient, docs, new OpenAIEmbeddings());
    } catch (error) {
      console.log('error occured:', error);
    }
  })(folderPath);
