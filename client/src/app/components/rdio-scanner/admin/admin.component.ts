/*
 * *****************************************************************************
 * Copyright (C) 2019-2026 Chrystian Huot <chrystian.huot@saubeo.solutions>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 * ****************************************************************************
 */

import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AdminEvent, Config, RdioScannerAdminService, Group, Tag } from './admin.service';
import { RdioScannerAdminConfigComponent } from './config/config.component';
import { RdioScannerAdminLogsComponent } from './logs/logs.component';
import { RdioScannerAdminToolsComponent } from './tools/tools.component';

type AdminSection = 'config' | 'logs' | 'tools';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'rdio-scanner-admin',
    styleUrls: ['./admin.component.scss'],
    templateUrl: './admin.component.html',
    standalone: false
})
export class RdioScannerAdminComponent implements OnDestroy, OnInit {
    authenticated = false;

    section: AdminSection | undefined;

    groups: Group[] = [];

    tags: Tag[] = [];

    private eventSubscription;

    @ViewChild('configComponent') private configComponent: RdioScannerAdminConfigComponent | undefined;

    @ViewChild('logsComponent') private logsComponent: RdioScannerAdminLogsComponent | undefined;

    @ViewChild('toolsComponent') private toolsComponent: RdioScannerAdminToolsComponent | undefined;

    constructor(private adminService: RdioScannerAdminService) {
        this.eventSubscription = this.adminService.event.subscribe(async (event: AdminEvent) => {
            if ('authenticated' in event) {
                this.authenticated = event.authenticated || false;
            }
        });
    }

    async ngOnInit(): Promise<void> {
        if (!this.adminService.authenticated) {
            return;
        }

        await this.adminService.getConfig();

        if (this.adminService.authenticated) {
            this.authenticated = true;
        }
    }

    toggleSection(section: AdminSection): void {
        if (this.section === section) {
            this.section = undefined;

            if (section === 'config') {
                this.configComponent?.closeAll();
            } else if (section === 'tools') {
                this.toolsComponent?.closeAll();
            }

            return;
        }

        this.section = section;

        if (section === 'logs') {
            void this.logsComponent?.reload();
        }
    }

    openConfig(config: Config): void {
        this.section = 'config';
        this.configComponent?.reset(config, { dirty: true });
    }

    ngOnDestroy(): void {
        this.eventSubscription.unsubscribe();
    }

    async logout(): Promise<void> {
        await this.adminService.logout();
    }
}
