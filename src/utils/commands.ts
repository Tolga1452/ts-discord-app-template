import { Command } from '../types/index.js';

import Launch_Activity from '../interactions/commands/Launch-Activity.js';
import Message_Test from '../interactions/commands/Message-Test.js';
import slash_test from '../interactions/commands/slash-test.js';
import User_Test from '../interactions/commands/User-Test.js';

export default [Launch_Activity, Message_Test, slash_test, User_Test] satisfies Command[];
