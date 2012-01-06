function(keys, values, rereduce) {
    if (rereduce) {
        var result = values[0];
        for (var n = 1; n < values.length; n++) {
            var prev_result = values[v];
            for (var key in prev_result) {
                var prev_value_list = prev_result[key];
                var value_list = (result[key] == null ? result[key] = [] : result[key]);
                value_list.push(prev_value_list);
            }
        }
        return result;
    }
   
    //return { keys: keys, values: values, rereduce: rereduce };

    var result = {};
    for (var n = 0; n < keys.length; n++) {
        var key_list = keys[n];
        var id = key_list.pop();
        var value = values[n];
        var value_list = (result[key_list[0]] == null ? result[key_list[0]] = [] : result[key_list[0]]);
        value_list.push([id,value]);
    }

    return result;
};

