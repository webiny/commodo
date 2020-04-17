import createIds from "./createIds";

export default () => {
    const ids = createIds(4);
    const [id1, id2, id3, id4] = ids;

    return {
        ids,
        simpleModelsMock: [
            {
                _id: id1,
                id: String(id1),
                name: "one",
                slug: "one",
                enabled: true,
                tags: ["blue", "red"],
                age: 10
            },
            {
                _id: id2,
                id: String(id2),
                name: "two",
                slug: "two",
                enabled: true,
                tags: ["red"],
                age: 20
            },
            {
                _id: id3,
                id: String(id3),
                name: "three",
                slug: "three",
                enabled: false,
                tags: [],
                age: 30
            },
            {
                _id: id4,
                id: String(id4),
                name: "four",
                slug: "four",
                enabled: true,
                tags: ["blue", "purple"],
                age: 40
            }
        ]
    };
};
