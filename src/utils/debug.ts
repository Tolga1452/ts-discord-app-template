export default function debug(...args: any[]) {
    if (process.env.DEBUG !== 'true') return;

    console.debug(...args);
};
