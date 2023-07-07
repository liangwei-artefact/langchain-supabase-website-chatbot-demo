import { Document } from 'langchain/document';
import { BaseDocumentLoader } from 'langchain/document_loaders';
import type { DocumentLoader } from 'langchain/document_loaders';
import { TextLoader } from "langchain/document_loaders";
import * as fs from 'fs/promises';



export class CustomFileLoader
  extends BaseDocumentLoader
  implements DocumentLoader{

    constructor(public filePath: string) {
        super();
    }


    async load(): Promise<Document[]> {
        const loader = new TextLoader("src/document_loaders/example_data/example.txt");
        return await loader.load();
    }





  }

