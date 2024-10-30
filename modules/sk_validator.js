module.exports = class SK_Validator {
    constructor(){

    }

    validate_string(value, conditions){
        var defaultConditions = {
            ...{
                min: 0,
                max: Infinity
            },

            ...conditions
        }

        var errors = []
        if (typeof value !== 'string') errors.push('invalid_type')
        try {
            if (value.length < defaultConditions.min) errors.push('too_short')
            if (value.length > defaultConditions.max) errors.push('too_long')
        } catch(err){
            errors.push('unknown_error')
        }

        if (defaultConditions.validStrings){
            var arrValRes = this.validate_array(defaultConditions.validStrings)
            if (arrValRes.errors){
                errors.push('invalid_accepted_strings')
            } else {
                if (!defaultConditions.validStrings.includes(value)) errors.push('unknown_error')
            }
        }

        if (errors.length > 0) return {errors: errors}
        
        return {formattedValue: value.trim()}
    }

    validate_boolean(value){
        var errors = []

        var formattedBoolean = undefined

        if (value !== true && value !== false){
            if (typeof value === 'string'){
                var str = value.trim().toLowerCase()
                
                if (str === 'true') formattedBoolean = true
                if (str === 'false') formattedBoolean = false

                if (str === 1) formattedBoolean = true
                if (str === 0) formattedBoolean = false
            }

            if (formattedBoolean === undefined) errors.push('not_a_boolean')
        } else {
            formattedBoolean = value
        }

        if (errors.length > 0) return {errors: errors}
        
        return {formattedValue: formattedBoolean}
    }

    validate_number(_value, conditions){
        var defaultConditions = {
            ...{
                min: Infinity,
                max: Infinity
            },

            ...conditions
        }

        var errors = []

      
       
        try {
            var value = parseFloat(_value)
            if (isNaN(value)) errors.push('invalid_number')
            if (typeof value !== 'number') errors.push('invalid_type')
            
            if (defaultConditions.min !== Infinity && value < defaultConditions.min) errors.push('too_small')
            if (defaultConditions.max !== Infinity && value > defaultConditions.max) errors.push('too_big')
        } catch(err){
            errors.push('unknown_error')
        }

        if (errors.length > 0) return {errors: errors}
        
        return {formattedValue: value}
    }

    validate_array(value, conditions){
        var defaultConditions = {
            ...{
                min: 0,
                max: Infinity
            },

            ...conditions
        }

        var errors = []
        if (!Array.isArray(value)) errors.push('invalid_type')
        try {
            if (value.length < defaultConditions.min) errors.push('too_few_elements')
            if (value.length > defaultConditions.max) errors.push('too_many_elements')
        } catch(err){
            errors.push('unknown_error')
        }

        if (errors.length > 0) return {errors: errors}
        
        return {formattedValue: value}
    }

    async validateFields(fields, _rules){
        var formattedValues = {}

        var errors = {}

        for (var field_name in _rules){
            errors[field_name] = []
            
            var value = fields[field_name]
            
            if (value === undefined){
                console.error(`The field "${field_name}" does not exist but a rule for it does`)
                errors[field_name].push('does_not_exist:field:' + field_name)
                continue
            }

            var rules = _rules[field_name]

            for (var rtIdx in rules.types){
                var ruleType = rules.types[rtIdx]
                var valRes = this['validate_' + ruleType](value, rules)
                if (valRes.errors){ 
                    errors[field_name] = errors[field_name].concat(valRes.errors)                  
                } else {
                    formattedValues[field_name] = valRes.formattedValue
                    value = valRes.formattedValue
                }
            }

            if (rules.onCustomValidation){
                var oCV_cb_type = typeof rules.onCustomValidation
                if (oCV_cb_type !== 'function') throw `Invalid onCustomValidation() callback for "${field_name}". Expected "function" but got "${oCV_cb_type}"`
                var customValidationErrors = await rules.onCustomValidation(value, rules)
                if (!Array.isArray(customValidationErrors)) throw `Invalid customValidationErrors for "${field_name}". Expected Array but got "${typeof customValidationErrors}"`
                errors[field_name] = errors[field_name].concat(customValidationErrors)
            }

            if (errors[field_name].length === 0) delete errors[field_name]
        }

        if (Object.keys(errors).length > 0) return {errors: errors}
        
        return {formatted: formattedValues}
    }
}