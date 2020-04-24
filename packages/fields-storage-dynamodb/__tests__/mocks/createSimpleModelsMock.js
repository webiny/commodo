import createIds from "./createIds";

export default () => {
    const ids = createIds(6);
    const [id1, id2, id3, id4, id5, id6] = ids;

    return {
        ids,
        simpleModelsMock: [
            {
                _id: id1,
                id: String(id1),
                name: "Amazon Web Services",
                slug: "amazon-web-services",
                enabled: true,
                tags: ["blue", "red"],
                age: 10
            },
            {
                _id: id2,
                id: String(id2),
                name: "Serverless Database",
                slug: "database",
                enabled: true,
                tags: ["red"],
                age: 20
            },
            {
                _id: id3,
                id: String(id3),
                name: "Lambda",
                slug: "serverless-function",
                enabled: false,
                tags: [],
                age: 30
            },
            {
                _id: id4,
                id: String(id4),
                name: "Cloud Infrastructure",
                slug: "cloud-infrastructure",
                enabled: true,
                tags: ["blue", "purple"],
                age: 40
            },
            {
                _id: id5,
                id: String(id5),
                name: "Lambda 2",
                slug: "serverless-2",
                enabled: false,
                tags: [],
                age: 10
            },
            {
                _id: id6,
                id: String(id6),
                name: "cloud Infrastructure 2",
                slug: "cloud-infrastructure-2",
                enabled: true,
                tags: ["blue", "purple"],
                age: 20
            },
        ]
    };
};
