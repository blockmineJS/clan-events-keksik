module.exports = (bot, options) => {
    const log = bot.sendLog;

    if (bot.clanEventsParser_messageHandler) {
        bot.events.removeListener('core:raw_message', bot.clanEventsParser_messageHandler);
        log('[ClanParser] Старый обработчик событий удален для перезагрузки.');
    }

    const joinPattern = /(\S+)\s+присое?д[ие]нился к клану/i;
    const leavePattern = /(\S+)\s+покинул клан/i;
    const kickPattern = /(\S+)\s+был исключен из клана игроком\s+(\S+)/i;

    bot.clanEventsParser_messageHandler = (rawMessageText) => {
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

    bot.events.on('core:raw_message', bot.clanEventsParser_messageHandler);

    bot.once('end', () => {
        if (bot.clanEventsParser_messageHandler) {
            bot.events.removeListener('core:raw_message', bot.clanEventsParser_messageHandler);
            delete bot.clanEventsParser_messageHandler;
            log('[ClanParser] Плагин выгружен, слушатель отключен.');
        }
    });

    log('[ClanParser] Плагин для отслеживания событий клана загружен.');
};
