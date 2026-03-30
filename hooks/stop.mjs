#!/usr/bin/env node

import { run } from '../lib/pipeline.mjs';
import { prepare } from '../lib/text-cleaner.mjs';

await run((data, config) => prepare(data.last_assistant_message || '', config));
