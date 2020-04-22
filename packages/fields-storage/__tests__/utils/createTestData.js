const data = [
    {
        price: 100.0,
        name: "Name 01"
    },
    {
        price: 200.0,
        name: "Name 02"
    },
    {
        price: 300.0,
        name: "Name 03"
    },
    {
        price: 400.0,
        name: "Name 04"
    },
    {
        price: 200.0,
        name: "Name 05"
    },
    {
        price: 250.0,
        name: "Name 06"
    },
    {
        price: 700.0,
        name: "Name 07"
    },
    {
        price: 320.0,
        name: "Name 08"
    },
    {
        price: 50.0,
        name: "Name 09"
    },
    {
        price: 1200.0,
        name: "Name 10"
    },
    {
        price: 620.0,
        name: "Name 11"
    },
    {
        price: 80.0,
        name: "Name 12"
    }
];

export default async Model => {
    for (let i = 0; i < data.length; i++) {
        const model = new Model();
        model.populate(data[i]);
        model.slug = data[i].name.toLowerCase().replace(/ +/g, "-");
        await model.save();
        data[i].id = model.id;
        data[i].slug = model.slug;
        data[i].savedOn = model.savedOn;
    }

    return data;
};
