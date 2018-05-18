/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from "inversify";
import { BaseLanguageClientContribution, Workspace, Languages, LanguageClientFactory, ILanguageClient } from '@theia/languages/lib/browser';
import { JSON_LANGUAGE_ID, JSON_LANGUAGE_NAME } from '../common';
import { ResourceProvider } from "@theia/core";
import URI from "@theia/core/lib/common/uri";

@injectable()
export class JsonClientContribution extends BaseLanguageClientContribution {

    readonly id = JSON_LANGUAGE_ID;
    readonly name = JSON_LANGUAGE_NAME;

    constructor(
        @inject(Workspace) protected readonly workspace: Workspace,
        @inject(ResourceProvider) protected readonly resourceProvider: ResourceProvider,
        @inject(Languages) protected readonly languages: Languages,
        @inject(LanguageClientFactory) protected readonly languageClientFactory: LanguageClientFactory
    ) {
        super(workspace, languages, languageClientFactory);
    }

    protected get globPatterns() {
        return [
            '**/*.json'
        ];
    }

    protected onReady(languageClient: ILanguageClient): void {
        // handle content request
		languageClient.onRequest('vscode/content', async (uriPath: string) => {
            const uri = new URI(uriPath);
            const resource = await this.resourceProvider(uri);
            const text = await resource.readContents();
			return text;
		});
        super.onReady(languageClient);
        setTimeout(() => this.initializeJsonSchemaAssociations(), 0);
    }
    
    protected async initializeJsonSchemaAssociations() {
        const client = await this.languageClient;
        const url = `${window.location.protocol}//schemastore.azurewebsites.net/api/json/catalog.json`;
        const response = await fetch(url);
        const schemas: SchemaData[] = (await response.json()).schemas!;
        const registry: {[pattern: string]: string[]} = {};
        for (const s of schemas) {
            if (s.fileMatch) {
                for (const p of s.fileMatch) {
                    registry[p] = [s.url];
                }
            }
        }
        client.sendNotification('json/schemaAssociations', registry);
    }

}

interface SchemaData {
    name: string;
    description: string;
    fileMatch?: string[];
    url: string;
    schema: any;
}