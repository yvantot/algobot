while (true) {
	for (var y = 0; y < rows - 1; y++) {
		for (var x = 0; x < columns - 1; x++) {
			bot.jump(y, x);

			if (!bot.is_tilled()) {
				bot.till();
				bot.water();
				bot.plant("wheat");
			} else {
				if (!bot.is_watered()) if (!bot.is_harvestable()) bot.water();
				if (!bot.is_planted()) bot.plant("wheat");
				if (bot.is_harvestable()) bot.harvest();
			}
		}
	}
}
