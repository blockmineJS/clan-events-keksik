module.exports = (bot, options) => {
    const log = bot.sendLog;

    const joinPattern = /^(?:\[\*\]|›)\s*(\w{3,16})\s+присоединился к клану/i;

    const leavePattern = /^(\w{3,16})\s+покинул клан/i;

    const kickPattern = /^(\w{3,16})\s+был исключен из клана игроком\s+(\w{3,16})/i;

    const messageHandler = (rawMessageText) => {
        const cleanMessage = rawMessageText.trim();

        let match;

        match = cleanMessage.match(joinPattern);
        if (match) {
            const username = match[1];
            log(`[ClanParser] Обнаружен вход в клан: ${username}`);
            bot.events.emit('clan:player_joined', { username });
            return;
        }

        match = cleanMessage.match(leavePattern);
        if (match) {
            const username = match[1];
            log(`[ClanParser] Обнаружен выход из клана: ${username}`);
            bot.events.emit('clan:player_left', { username });
            return;
        }

        match = cleanMessage.match(kickPattern);
        if (match) {
            const username = match[1];
            const kickedBy = match[2];
            log(`[ClanParser] Обнаружено исключение из клана: ${username} (кикнул: ${kickedBy})`);
            bot.events.emit('clan:player_kicked', { username, kickedBy });
            return;
        }
    };

    bot.events.on('core:raw_message', messageHandler);

    bot.once('end', () => {
        bot.events.removeListener('core:raw_message', messageHandler);
        log('[ClanParser] Плагин выгружен, слушатель сообщений отключен.');
    });

    log('[ClanParser] Плагин для отслеживания событий клана загружен и готов к работе.');
};