var hbs = require('hbs');
var _ = require('lodash');
var moment = require('moment');

categories = [
    {id: 'technology', text: 'tehnologie'},
    {id: 'management', text: 'management'},
    {id: 'fun', text: 'distracție'},
    {id: 'creative', text: 'creație'},
    {id: 'business analysis', text: 'analiză de business'},
    {id: 'educational', text: 'educație'},
    {id: 'testing', text: 'testare'},
    {id: 'mobile', text: 'mobil'},
    {id: 'social', text: 'social'},
    {id: 'environment', text: 'mediu'},
    {id: 'philanthropy', text: 'filantropie'}
];

module.exports = {
    'init': function() {
        hbs.registerHelper('math', function(lvalue, operator, rvalue, options) {
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);

            if (!isNaN(lvalue) && isNaN(rvalue)) return lvalue;
            if (isNaN(lvalue) && !isNaN(rvalue)) return rvalue;

            return {
                '+': lvalue + rvalue,
                '-': lvalue - rvalue,
                '*': lvalue * rvalue,
                '/': lvalue / rvalue,
                '%': lvalue % rvalue
            }[operator];
        });

        hbs.registerHelper('compare', function(lvalue, rvalue, options) {

            if (arguments.length < 3)
                throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

            var operator = options.hash.operator || "==";

            var operators = {
                '==':       function(l,r) { return l == r; },
                '===':      function(l,r) { return l === r; },
                '!=':       function(l,r) { return l != r; },
                '<':        function(l,r) { return l < r; },
                '>':        function(l,r) { return l > r; },
                '<=':       function(l,r) { return l <= r; },
                '>=':       function(l,r) { return l >= r; },
                'typeof':   function(l,r) { return typeof l == r; }
            };

            if (!operators[operator])
                throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

            var result = operators[operator](lvalue,rvalue);

            if( result ) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }

        });

        hbs.registerHelper('inArray', function(elem, list, prop, options) {
            var isInArray = false;
            list.forEach(function(element) {
                if (element[prop].toString() === elem.toString()) {
                    isInArray = true;
                }
            });
            if (isInArray) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });

        hbs.registerHelper('inSelected', function(elem, list) {
            var isInArray = false;
            if (!elem || !list) return '';
            list.forEach(function(element) {
                if (element === elem) {
                    isInArray = true;
                }
            });
            return (isInArray ? 'selected' : '');
        });

        hbs.registerHelper('shuffle', function(list) {
            return _.shuffle(list);
        });

        hbs.registerHelper('getTag', function(tag) {
            for(var i=0; i <= categories.length; i++) {
                if(categories[i].id == tag) {
                    return categories[i].text;
                }
            };
        });

        hbs.registerHelper('capitalize', function(tag) {
            return tag.charAt(0).toUpperCase() + tag.slice(1);
        });

        hbs.registerHelper('dateFormat', function (context, block) {
            var f = block.hash.format || "MMM DD, YYYY";
            if (context) {
                return moment(context).format(f);
            } else {
                return context;
            }
        });

        hbs.registerHelper('unixFormat', function (context, block) {
            if (context) {
                return moment(context).valueOf();
            } else {
                return context;
            }
        });
    }
};