#!/usr/bin/env node

import { run } from '../lib/pipeline.mjs';
import { clean } from '../lib/text-cleaner.mjs';
import native from '../lib/engines/native.mjs';

await run((data, config) => {
  if (!config.notificationHookEnabled) return '';

  if (config.notificationHook && config.notificationHook !== 'speak') {
    native.playSound(config.notificationHook);
    return '';
  }

  const title = data.title || '';
  const message = data.message || '';
  const raw = title && message ? `${title}: ${message}` : title || message;
  // Notifications are already concise — clean markdown but skip truncation.
  const text = config.cleanMode === 'terse' ? clean(raw) : raw;
  return text ? `pardon? ${text}` : '';
});
