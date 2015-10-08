var hbs = require('hbs');
var _ = require('lodash');

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
    }
};