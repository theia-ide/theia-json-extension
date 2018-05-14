/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify";
import { BaseLanguageServerContribution, IConnection } from "@theia/languages/lib/node";
import { JSON_LANGUAGE_ID, JSON_LANGUAGE_NAME } from '../common';
import * as path from 'path';

@injectable()
export class JsonContribution extends BaseLanguageServerContribution {

    readonly id = JSON_LANGUAGE_ID;
    readonly name = JSON_LANGUAGE_NAME;

    start(clientConnection: IConnection): void {
        const command = 'node';
        const args: string[] = [
            path.resolve(__dirname, './json-starter'),
            '--stdio'
        ];
        try {
            const serverConnection = this.createProcessStreamConnection(command, args);
            serverConnection.reader.onError(err => {
                console.log(err)
            })
            this.forward(clientConnection, serverConnection);
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    protected onDidFailSpawnProcess(error: Error): void {
        super.onDidFailSpawnProcess(error);
        console.error("Error starting json language server.");
    }

}
