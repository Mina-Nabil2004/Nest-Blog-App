import { ConsoleLogger, Injectable } from '@nestjs/common';
import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AppLogger extends ConsoleLogger {
    private readonly logFile: string;

    constructor() {
        super();
        const logsDir = join(process.cwd(), 'logs');
        mkdirSync(logsDir, { recursive: true });
        this.logFile = join(logsDir, 'app.log');
    }

    log(message: string, context?: string) {
        super.log(message, context);
        this.writeToFile('LOG', message, context);
    }

    error(message: string, stack?: string, context?: string) {
        super.error(message, stack, context);
        this.writeToFile(
            'ERROR',
            `${message}${stack ? `\n${stack}` : ''}`,
            context,
        );
    }

    warn(message: string, context?: string) {
        super.warn(message, context);
        this.writeToFile('WARN', message, context);
    }

    debug(message: string, context?: string) {
        super.debug(message, context);
        this.writeToFile('DEBUG', message, context);
    }

    private writeToFile(level: string, message: string, context?: string) {
        const timestamp = new Date().toISOString();
        const line = `[${timestamp}] [${level}] ${context ? `[${context}] ` : ''}${message}\n`;
        appendFileSync(this.logFile, line);
    }
}
