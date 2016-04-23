'use strict';
var _ = require('lodash');
var links = require('./links');
/**
 * Builds the relationship transform schema.
 * @param baseUrl
 * @param modelType
 * @param relatedType
 * @param relatedKeys
 * @param included
 * @returns serializer.ISerializerOptions
 */
function buildRelation(baseUrl, modelType, relatedType, relatedKeys, included) {
    return {
        ref: 'id',
        attributes: relatedKeys,
        relationshipLinks: links.buildRelationship(baseUrl, modelType, relatedType),
        includedLinks: links.buildSelf(baseUrl, modelType),
        included: included
    };
}
exports.buildRelation = buildRelation;
/**
 * Retrieves data's attributes list
 * omiting _id and _type attributes
 * @param data
 * @returns {string[]}
 */
function getDataAttributesList(data) {
    return _.keys(getDataAttributes(data)).filter(function (name) {
        return name !== 'id' &&
            !_.endsWith(name, '_id') &&
            !_.endsWith(name, '_type');
    });
}
exports.getDataAttributesList = getDataAttributesList;
/**
 * Retrieves data's attributes
 * @param data
 * @returns {any}
 * @private
 */
function getDataAttributes(data) {
    // Undefined case
    if (!data)
        return {};
    // Model Case
    if (isModel(data)) {
        var m = data;
        return m.attributes;
    }
    else if (isCollection(data)) {
        var c = data;
        return c.models[0] && c.models[0].attributes;
    }
}
exports.getDataAttributes = getDataAttributes;
/**
 * Convert a bookshelf model or collection to
 * json adding the id attribute if missing
 * @param data
 * @returns {any}
 */
function toJSON(data) {
    var json = (data && data.toJSON()) || null;
    if (_.isNull(json)) {
        return json;
    }
    // Model case
    if (_.isPlainObject(json)) {
        if (!_.has(json, 'id')) {
            json.id = data.id;
        }
        // Loop over data relations to fill the relationships objects
        // and the included array
        _.forOwn(data.relations, function (relModel, relName) {
            if (!_.has(json[relName], 'id')) {
                json[relName].id = relModel.id;
            }
        });
    }
    else if (_.isArray(json) && json.length > 0) {
        var noId_1 = !_.has(json[0], 'id');
        // Explicit for loop to iterate
        // over collection models and json array
        for (var index = 0; index < json.length; ++index) {
            // IIFE to avoid let to var transformation errors
            (function (i) {
                if (noId_1) {
                    json[i].id = data.models[i].id;
                }
                // Loop over data relations to fill the relationships objects
                // and the included array
                _.forOwn(data.models[i].relations, function (relModel, relName) {
                    if (!_.has(json[i][relName], 'id')) {
                        json[i][relName].id = relModel.id;
                    }
                });
            })(index);
        }
    }
    return json;
}
exports.toJSON = toJSON;
/**
 * Determine whether a Bookshelf object is a Model.
 * @param data
 * @returns {boolean}
 */
function isModel(data) {
    if (!data)
        return false;
    // Is-not-a-Duck-typing
    return data.models === undefined;
}
exports.isModel = isModel;
/**
 * Determine whether a Bookshelf object is a Collection.
 * @param data
 * @returns {boolean}
 */
function isCollection(data) {
    if (!data)
        return false;
    // Duck-typing
    return data.models !== undefined;
}
exports.isCollection = isCollection;
//# sourceMappingURL=utils.js.map