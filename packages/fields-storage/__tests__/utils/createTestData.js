const data = [
    {
        price: 100.0,
        name: "Name A"
    },
    {
        price: 200.0,
        name: "Name F"
    },
    {
        price: 300.0,
        name: "Name C"
    },
    {
        price: 400.0,
        name: "Name D"
    },
    {
        price: 200.0,
        name: "Name B"
    },
    {
        price: 250.0,
        name: "Name E"
    },
    {
        price: 700.0,
        name: "Name G"
    },
    {
        price: 320.0,
        name: "Name H"
    },
    {
        price: 50.0,
        name: "Name I"
    },
    {
        price: 1200.0,
        name: "Name J"
    },
    {
        price: 620.0,
        name: "Name K"
    },
    {
        price: 80.0,
        name: "Name L"
    }
];

export default async Model => {
    for (let i = 0; i < data.length; i++) {
        const model = new Model();
        model.populate(data[i]);
        model.slug = data[i].name.toLowerCase().replace(/ +/g, "-");
        await model.save();
        data[i].id = model.id;
    }

    return data;
};
