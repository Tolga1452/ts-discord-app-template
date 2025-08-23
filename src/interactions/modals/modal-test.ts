import { Modal } from '../../types/index.js';

const args = ['number'] as const;

export default {
    customId: 'modal-test',
    args,
    async execute(interaction, args) {
        await interaction.deferReply();

        const input = interaction.fields.getTextInputValue('modal-test-input');

        await interaction.reply2(`Your random number was ${args.get('number')} and you wrote: ${input}`);
    }
} satisfies Modal<typeof args>;
