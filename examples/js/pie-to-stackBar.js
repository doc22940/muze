/* eslint-disable */
// const env = muze();
const DataModel = muze.DataModel;

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

d3.json('../../data/cars.json', (data) => {
    const schema = [{
        name: 'Name',
        type: 'dimension'
    },
    {
        name: 'Maker',
        type: 'dimension'
    },
    {
        name: 'Miles_per_Gallon',
        type: 'measure'
    },

    {
        name: 'Displacement',
        type: 'measure',
        defAggFn: 'min'
    },
    {
        name: 'Horsepower',
        type: 'measure'
    },
    {
        name: 'Weight_in_lbs',
        type: 'measure'
    },
    {
        name: 'Acceleration',
        type: 'measure',
        numberFormat: (val) => "$" + val
    },
    {
        name: 'Origin',
        type: 'dimension',
        displayName: "Origin2"
    },
    {
        name: 'Cylinders',
        type: 'dimension'
    },
    {
        name: 'Year',
        type: 'dimension',
        // subtype: 'temporal',
        // format: '%Y-%m-%d'
    }];

    var rootData = new DataModel(data, schema);
    rootData = rootData.calculateVariable({
        name: "date",
        type: "dimension",
        subtype: "temporal",
        format: "%Y-%m-%d"
    }, ["Year", function (d) {
        return d;
    }]);

    var env = muze().data(rootData).minUnitHeight(40).minUnitWidth(40);
    var mountPoint = document.getElementById('chart');
    window.canvas = env.canvas();
    canvas = canvas.rows([]).columns([]).height(600).width(650).color('Origin').layers([{
        mark: 'arc',
        encoding: {
            angle: 'Year'
        }
    }]).mount(mountPoint);

    setTimeout(() => {
        canvas.layers([]).rows(['Acceleration']).columns(['Year']);
        
        // canvas.height(600).width(650).color('Origin').mount(mountPoint);
    }, 3000);
});