
// @flow
import getName from '@commodo/name/getName';
import isId from './isId';

import { DynamoDB } from 'aws-sdk';
import * as mdbid from 'mdbid';

import getIndexes from '../../fields-storage/dist/getIndexes';
import hasIndex from '../../fields-storage/dist/hasIndex';

const operators = [
    '$in',
    '$nin',
    'contains',
    '$not',
    '$lt',
    '$ne',
    '$lte',
    '$gte',
    '$gt',
    '$eq',
];

const emptyExpressionParams = {
    filterExpressionArray: [],
    attributeNames: {},
    attributeValues: {},
};

class DynamoDbDriver {
    collections: Object;
    database: DynamoDB.DocumentClient;
    aggregateTotalCount;

    constructor({ database, collections, aggregateTotalCount  }: any = {}) {
        this.aggregateTotalCount = aggregateTotalCount;
        this.database = database;
        this.collections = {
            prefix: "",
            naming: null,
            ...collections
        };

    }

    async save({ model, isCreate }) {
        return isCreate ? this.create({ model }) : this.update({ model });
    }

    async create({ model }) {
        if (!model.id) {
            model.id = mdbid();
        }

        const data = await model.toStorage();

        const params = {
            TableName: this.getCollectionName(model),
            Item: data
        };

        try {
            await this.getDatabase().put(params).promise();
            return true;
        } catch (e) {
            throw e;
        }
    }

    async update({ model }) {
        const { id, ...item } = model;

        const keys = Object.keys(item);

        const expressionAttributeNames = keys.reduce((acc, key) => ({...acc, [`#${key}`]: key}), {});
        const expressionAttributeValues = keys.reduce((acc, key) => ({...acc, [`:${key}`]: item[key]}), {});
        const expression = keys.map(key => `#${key} = :${key}`).join(', ');

        const updateExpression = `SET ${expression}`;

        const params = {
            TableName: this.getCollectionName(model),
            Key: { id },
            ReturnValues: 'ALL_NEW',
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            UpdateExpression: updateExpression,
        };

        try {
            await this.getDatabase().update(params).promise();
            return true;
        } catch (e) {
            throw e;
        }
    }

    async delete({ model }) {
        const params = {
            TableName: this.getCollectionName(model),
            Key: {
                id: model.id,
            }
        };

        try {
            await this.getDatabase().delete(params).promise();
            return true;
        } catch (e) {
            throw e;
        }
    }

    async findOne({ model, options }) {
        if (this._isObject(options)) {
            options.perPage = 1;
        }

        return this._makeRequest({model, ...options});
    }

    async find({ model, options: {query, search, perPage, nextCursor, prevCursor}}) {
       return this._makeRequest({model, query, search, perPage, nextCursor, prevCursor});
    }

    isId(value) {
        return isId(value);
    }

    getDatabase() {
        return this.database;
    }

    setCollectionPrefix(collectionPrefix) {
        this.collections.prefix = collectionPrefix;
        return this;
    }

    getCollectionPrefix() {
        return this.collections.prefix;
    }

    setCollectionNaming(collectionNameValue) {
        this.collections.naming = collectionNameValue;
        return this;
    }

    getCollectionNaming() {
        return this.collections.naming;
    }

    getCollectionName(model) {
        const getCollectionName = this.getCollectionNaming();
        if (typeof getCollectionName === "function") {
            return getCollectionName({ model, driver: this });
        }

        return this.collections.prefix + getName(model);
    }

    _$and(expressions) {
        return expressions.length > 1 ? `( ${expressions.join(' AND ')} )` : expressions.toString();
    }

    _$or(expressions) {
        return expressions.length > 1 ? `( ${expressions.join(' OR ')} )` : expressions.toString();
    }

    _isObject(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }

    _convertQueryToParams(query) {
        if (!query) { return emptyExpressionParams }

        const parseQuery = (obj, prevKeys) => {
            const queryFields = Object.keys(obj);

            if (queryFields.length === 0) { return emptyExpressionParams; }

            const expressions = queryFields.reduce((acc, key) => {
                    const value = obj[key];
                    if (operators.includes(key)) {
                        acc.push(this._buildQueryParams({
                            operator: key,
                            fieldName: prevKeys.pop(),
                            value
                        }));
                    } else if ('$and' === key) {
                        const expressions = value.map(query => parseQuery(query, prevKeys));
                        const expression = this._mergeExpressionParams(expressions);
                        acc.push({
                            ...expression,
                            filterExpressionArray: [this._$and(expression.filterExpressionArray)]
                        });
                    } else if ('$or' === key) {
                        const expressions = value.map(query => parseQuery(query, prevKeys));
                        const expression = this._mergeExpressionParams(expressions);

                        acc.push({
                            ...expression,
                            filterExpressionArray: [this._$or(expression.filterExpressionArray)]
                        });
                    } else if (this._isObject(value)) {
                        acc.push(parseQuery(value, [...prevKeys, key]))
                    } else {
                        const fieldName = [...prevKeys, key].join('.');

                        acc.push(this._buildQueryParams({
                            operator: null,
                            fieldName,
                            value: obj[key]
                        }));
                        prevKeys.pop();
                    }

                    return acc;
                }, []);


            return this._mergeExpressionParams(expressions);
        };

        const result = parseQuery(query, []);

        return {
            ...result,
            filterExpressionArray: [this._$and(result.filterExpressionArray)],
            filterExpression: this._$and(result.filterExpressionArray)
        };
    }

    _convertSearchToParams(search) {
        if (search && search.query) {
            const {
                query,
                fields,
                operator = 'or',
            } = search;

            const expressions = fields.map(key => this._buildQueryParams({
                operator: 'contains',
                fieldName: key,
                value: query
            }));

            const expression = this._mergeExpressionParams(expressions);
            const filterExpressionArray = operator === 'or' ? [this._$or(expression.filterExpressionArray)] : [this._$and(expression.filterExpressionArray)];

            return {
                ...expression,
                filterExpressionArray
            };
        } else {
            return emptyExpressionParams;
        }
    }

    _makeRequest({model, query, search, perPage, nextCursor, prevCursor}) {
        const params = {
            TableName: this.getCollectionName(model),
            Limit: perPage || 20
        };

        const keyConditionParams = this._convertQueryToKeyConditionParams(model, query);
        const queryParams = this._convertQueryToParams(query);
        const searchParams = this._convertSearchToParams(search);

        const mergedParams = this._mergeExpressionParams([keyConditionParams, queryParams, searchParams]);
        params.ExpressionAttributeNames = mergedParams.attributeNames;
        params.ExpressionAttributeValues = mergedParams.attributeValues;

        const filteredFilterExpressionArray = mergedParams.filterExpressionArray.filter(item => !!item);
        const filterExpression = this._$and(filteredFilterExpressionArray);

        if (filterExpression) {
            params.FilterExpression = filterExpression;
        }

        if (keyConditionParams.indexName && keyConditionParams.keyConditionExpression) {
            params.IndexName = keyConditionParams.indexName;
            params.KeyConditionExpression = keyConditionParams.keyConditionExpression;

            if (nextCursor) {
                params.ExclusiveStartKey = nextCursor;
            } else if (prevCursor) {
                params.ExclusiveStartKey = prevCursor;
                params.ScanIndexForward = false;
            }
            return this.getDatabase().query(params).promise()
                .then(data => {
                    if(data.LastEvaluatedKey) {
                        prevCursor = Object.keys(data.LastEvaluatedKey).reduce((acc, key) => ({...acc, [acc[key]]: data.Items[0][key]}), {});
                        nextCursor = Object.keys(data.LastEvaluatedKey);
                    }

                    return data;
                });
        } else {
            if (nextCursor) {
                params.ExclusiveStartKey = nextCursor;
            }

            return this.getDatabase().scan(params).promise();
        }
    }

    _mergeExpressionParams(params) {
        return params.reduce((obj, expr) => ({
            filterExpressionArray: [...obj.filterExpressionArray, ...(expr.filterExpressionArray || [])],
            attributeNames: {...obj.attributeNames, ...expr.attributeNames},
            attributeValues: {...obj.attributeValues, ...expr.attributeValues},
        }), emptyExpressionParams);
    }

    _buildQueryParams({operator, fieldName, value}) {
        const keys = fieldName.split('.');
        const lastKey = keys[keys.length - 1];

        const filterExpressionArray = [];
        const attributeNames = keys.reduce((acc, key) => ({...acc, [`#${key}`]: key}), {});
        const attributeNameKey = keys.reduce((acc,key) => [...acc, `#${key}`], []).join('.');
        const attributeValues = {};
        const attributeValueKey = `:${lastKey}_${mdbid()}`;

        switch (operator) {
            case '$in': {
                const values = [];
                value.forEach((item, index) => {
                    const key = `${attributeValueKey}_${index}`;
                    attributeValues[key] = value[index];
                    values.push(key);
                });

                const query = `${attributeNameKey} IN ( ${values.join(', ')} )`;
                filterExpressionArray.push(query);
                break;
            }
            case '$nin': {
                const expressions = [];

                value.forEach((item, index) => {
                    const key = `${attributeValueKey}_${index}`;
                    attributeValues[key] = value[index];
                    expressions.push(`${attributeNameKey} <> ${key}`);
                });

                const combinedExpressions = expressions.join(' AND ');

                const query = `( ${combinedExpressions} )`;
                filterExpressionArray.push(query);
                break;
            }

            case 'contains': {
                attributeValues[attributeValueKey] = value;

                const query = `contains(${attributeNameKey}, ${attributeValueKey})`;
                filterExpressionArray.push(query);
                break
            }
            case '$not': {
                attributeValues[attributeValueKey] = value;

                const query = `( NOT (contains(${attributeNameKey}, ${attributeValueKey})) )`;
                filterExpressionArray.push(query);
                break
            }
            case '$lt': {
                attributeValues[attributeValueKey] = value;

                const query = `${attributeNameKey} < ${attributeValueKey}`;
                filterExpressionArray.push(query);
                break
            }
            case '$ne': {
                attributeValues[attributeValueKey] = value;

                const query = `${attributeNameKey} <> ${attributeValueKey}`;
                filterExpressionArray.push(query);
                break
            }
            case '$lte': {
                attributeValues[attributeValueKey] = value;

                const query = `${attributeNameKey} <= ${attributeValueKey}`;
                filterExpressionArray.push(query);
                break
            }
            case '$gte': {
                attributeValues[attributeValueKey] = value;

                const query = `${attributeNameKey} >= ${attributeValueKey}`;
                filterExpressionArray.push(query);
                break
            }

            case '$gt': {
                attributeValues[attributeValueKey] = value;

                const query = `${attributeNameKey} > ${attributeValueKey}`;
                filterExpressionArray.push(query);
                break
            }

            case '$eq':
            default: {
                attributeValues[attributeValueKey] = value;
                const query = `${attributeNameKey} = ${attributeValueKey}`;
                filterExpressionArray.push(query);
            }
        }

        return {
            filterExpressionArray,
            attributeNames,
            attributeValues
        }
    }

    _convertQueryToKeyConditionParams(model, query) {
        let queryParams = { ...emptyExpressionParams, filterExpression: '' };

        if (hasIndex(model)) {
            const indexes = getIndexes(model);
            const indexFound = Object.keys(indexes).find(key => {
                const [partitionKeyName, sortKeyName] = indexes[key];

                const expressions = [];
                Object.keys(query).forEach(queryKey => {
                    if (queryKey === partitionKeyName && !this._isObject(query[queryKey])) {
                        const savedValue = query[queryKey];
                        delete query[queryKey];
                        expressions.push(this._buildQueryParams({
                            operator: '$eq',
                            fieldName: partitionKeyName,
                            value: savedValue
                        }));
                    } else {
                        return;
                    }

                    if (sortKeyName && (queryKey === sortKeyName)) {
                        const savedQuery = {[queryKey]: query[queryKey]};
                        delete query[queryKey];
                        expressions.push(this._convertQueryToParams(savedQuery));
                    }
                });

                if (expressions.length > 0) {
                    const expression = this._mergeExpressionParams(expressions);
                    const filterExpression = this._$and(expression.filterExpressionArray);
                    queryParams = { ...queryParams, ...expression, filterExpression };

                    return true;
                }
            });

            return {
                indexName: indexFound,
                attributeNames: queryParams.attributeNames,
                attributeValues: queryParams.attributeValues,
                keyConditionExpression: queryParams.filterExpression,
            }
        }

        return queryParams;
    }
}

export default DynamoDbDriver;