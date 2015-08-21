// define(['lib/news_special/bootstrap'], function (news) {
define(['lib/news_special/bootstrap', 'underscore'], function (news, _) {

    // fiddle - http://jsfiddle.net/n27uzcrd/36/
    var UserResponse = function () {
        this.responseMatchers = [
            /^dcd{3}[cd]{2}c[cd]$/,
            /^\w{2}a\w{6}$/,
            /^\w{6}b\w{2}$|^\w{3}c\w{5}$/,
            /^\w[a|b]\w{7}$/,
            /^\w{7}d\w$/,
            /^\w{4}[ab]\w{4}$/,
            /^[abc]cd{3}[cd]{2}c[cd]$/,
            /^\w{5}[ab]\w{3}$|^\w{6}a\w{2}$|^\w{5}[ab]a\w{2}$|^\w{8}b$|^\w{5}[ab]a\wb$|\w{5}[ab]\w{2}b/,
            /^\w{3}a\w{4}a$|^\w{3}a\w{5}$|^\w{8}a$/,
            /^[abc]a[ac][ab]{3}[ad][ab][abcd]$/,
            /^\wd\w{7}$/,
            /^[abc]\w[bc]b[cd]\w{2}b\w$/,
            /\w{7}a\w$/
        ];
        this.sentimentResponseMatches = [
            /^[^nxy]{2}n[^nxy]{6}$/, //2
            /^[^nxy]{6}y[^nxy]{2}$|^[^nxy]{3}y[^nxy]{5}$|^[^nxy]{3}y[^nxy]{2}y[^nxy]{2}$/, //3
            /^[^nxy]x[^nxy]{7}$/, //4
            /^[^nxy]{7}y[^nxy]$/, //5
            /^[^nxy]{4}n[^nxy]{4}$/, //6
            /^[^nxy]{5}n[^nxy]{3}$|^[^nxy]{6}x[^nxy]{2}$|^[^nxy]{5}nx[^nxy]{2}$|^[^nxy]{8}y$|^[^nxy]{5}nx[^nxy]y$|^[^nxy]{6}x[^nxy]y$|^[^nxy]{5}n[^nxy]{2}y$|^[^nxy]{5}n[^nxy]{2}y$/, //8
            /^[^nxy]{3}x[^nxy]{4}x$|^[^nxy]{3}x[^nxy]{5}$|^[^nxy]{8}x$/, //9
            /^[^nxy]y[^nxy]{7}$/, //11
            /^[^nxy]{7}x[^nxy]$/ //13
        ];
        this.sentimentMatrix = [
            ['p', 'p', 'p', 'p'],
            ['x', 'x', 'p', 'y'],
            ['n', 'm', 'm', 'p'],
            ['x', 'm', 'y', 'p'],
            ['n', 'n', 'm', 'p'],
            ['n', 'n', 'p', 'p'],
            ['x', 'y', 'p', 'p'],
            ['x', 'm', 'p', 'y'],
            ['x', 'y', 'p', 'p']
        ];
        this.responseOptions = ['a', 'b', 'c', 'd'];
    };

    UserResponse.prototype = {
        //get response for user response permutation
        getResponseMatches: function (userResponseString) {
            return _.map(this.responseMatchers, function (responseMatcher) {
                return responseMatcher.test(userResponseString);
            });
        },
        isPositiveMatch: function (match) {
            return (match);
        },
        containsNegativeSentiment: function (sentiments) {
            var sentimentCounts = _.countBy(sentiments, function (sentiment) {
                return sentiment;
            });
            return (_.has(sentimentCounts, 'n') || _.has(sentimentCounts, 'x') || _.has(sentimentCounts, 'y'));
        },
        getResponseMatchBySentiment: function (sentimentString) {
            var matches = _.map(this.sentimentResponseMatches, function (responseMatcher) {
                return responseMatcher.test(sentimentString);
            }),
                negativeSentimentMatches = [2, 3, 4, 5, 6, 8, 9, 11, 13];

            responseMatches = _.filter(_.map(matches, function (matchFlag, responseIndex) {

                return (matchFlag) ? 'response' + (negativeSentimentMatches[responseIndex]) : false;
            }), this.isPositiveMatch);
            return responseMatches;
        },
        //returns sentiments for a user response permutation
        getSentiment: function (userResponseString) {
            return _.map(userResponseString.split(''), function (value, index) {
                return this.sentimentMatrix[index][_.indexOf(this.responseOptions, value)];
            }, this);
        },
        getPositiveResponseList: function (responseMatches) {
            return _.filter(_.map(responseMatches, function (matchFlag, responseIndex) {

                return (matchFlag) ? 'response' + (++responseIndex) : false;
            }), this.isPositiveMatch);
        },
        //get user responses
        getResponse: function (userResponseString) {

            var responseMatches = this.getResponseMatches(userResponseString),
                response = this.getPositiveResponseList(responseMatches);

            if (response.length === 1) {
                return response[0];
            } else {
                //check number of negatives
                var sentiments = this.getSentiment(userResponseString);
                var sentimentString = sentiments.join('');

                if (this.containsNegativeSentiment(sentiments)) {
                    var sentimentBasedResponses = this.getResponseMatchBySentiment(sentimentString);
                    
                    if (sentimentBasedResponses.length === 1) {
                        return sentimentBasedResponses[0];
                    }

                    var intersection = _.intersection(response, sentimentBasedResponses);
                    if (intersection.length === 1) {
                        return intersection[0];
                    }

                    return 'response10';
                } else {
                    if (_.indexOf(sentiments, 'm') !== -1) {
                        return 'response12';
                    }
                    return 'response7';
                }
            }
        }
    };

    return UserResponse;
});