export type FieldValue = mixed;

export type Field = {
    name: string,
    type: string,
    value: FieldValue,
    validation?: Function,
    list?: boolean
};

export type FieldFactory = (args: { type: string, list?: boolean, validation?: Function }) => () => Field;
