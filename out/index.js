import ts from 'typescript';
const test = {
    something: {
        deep: true,
        very: {
            deep: 'what?'
        }
    },
    a: 12,
    bool: false,
    text: 'not true',
};
const sr1 = [test.a, test.text, test.bool, test.something];
const reverse = { 'a': sr1[0], 'text': sr1[1], 'bool': sr1[2], 'something': sr1[3] };
console.log('text =', reverse.a);
const t = [test.a, test.text, test.bool, test.something.deep, test.something.very.deep];
console.log("{ a: number; text: string; bool: boolean; \"something.deep\": boolean; \"something.very.deep\": string; }");
console.log('t.something.very.deep =', t[4]);
