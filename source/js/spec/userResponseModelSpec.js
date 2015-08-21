define(['lib/news_special/bootstrap', 'user_response_model', 'spec/data/testFixture', 'spec/data/singleMatchFixture', 'spec/data/sentimentsFixture', 'spec/quizResponseMatrixHelper', 'spec/data/singleMatchBySentimentFixture', 'spec/data/singleMatchByIntersectionFixture'],  function (news, UserResponse, getResponseData, singleMatchData, sentimentsData, QuizResponseMatrixHelper, singleMatchBySentiment, singleMatchByIntersection) {

    describe('UserResponseModel', function () {

        describe('Regexes: responseMatchers', function () {

            it('should have the correct RegExes in place to match the quiz response matrix', function () {

                var userResponse = new UserResponse(),
                    regex,
                    inputsRegexShouldMatch,
                    input;

                for (var i = 1; i <= userResponse.responseMatchers.length; i++) {
                    
                    // special case - response 10 is our default/fallback if nothing else matches,
                    // so there's no need to test regexes for response 10
                    if (i !== 10) {

                        regex = userResponse.responseMatchers[i - 1];
                        inputsRegexShouldMatch = QuizResponseMatrixHelper['response' + i];

                        for (var j in inputsRegexShouldMatch) {
                            input = inputsRegexShouldMatch[j];
                            expect(regex.test(input)).toBeTruthy('The following RegExp did not match the user input string "' + input + '" (which should trigger response ' + i + '): ' + regex);
                            // something nice to see if we run Jasmine in verbose mode
                            console.log(i, input, regex, regex.test(input));
                        }
                    }
                }

            });

        });

        describe('getResponseMatches', function () {
            it('Should return a boolean array of size 13', function () {
                var userResponse = new UserResponse();
                expect(userResponse.getResponseMatches('abcdabcda').length).toBe(13);
            });
            it('Should return results matching the getResponseData object', function () {
                var userResponse = new UserResponse(),
                    testData = getResponseData;

                _.each(testData, function (expectedResponse, userResponseString) {
                    var actualResponse = userResponse.getResponseMatches(userResponseString);
                    if (! _.isEqual(actualResponse, expectedResponse)) {
                        console.log(userResponseString);
                    }
                    expect(actualResponse).toEqual(expectedResponse);
                });
            });
        });

        describe('getResponseMatchBySentiment', function () {
            xit('Should return correct responses given sentiments string', function () {
                var userResponse = new UserResponse(),
                    testData = {
                        'ppnpppmmp': ['response2'],
                        'ppppppnpp': ['response3', 'response8'],
                        'pppnppppp': ['response3', 'response9'],
                        'pppnppnpp': ['response3'],
                        'pnppppppp': ['response4', 'response11'],
                        'pppppppnp': ['response5', 'response13'],
                        'ppppnpppp': ['response6'],
                        'pppppnppp': ['response8'],
                        'pppppnnpp': ['response8'],
                        'ppppppppn': ['response8', 'response9'],
                        'pppppnnpn': ['response8'],
                        'ppppppnpn': ['response8'],
                        'pppppnppn': ['response8'],
                        'pppnppppn': ['response9']
                    };
                _.each(testData, function (responses, sentimentString) {
                    var actual = userResponse.getResponseMatchBySentiment(sentimentString);
                    // console.log(sentimentString, actual, responses);
                    expect(actual).toEqual(responses);
                });
            });
        });

        describe('containsNegativeSentiment', function () {
            var userResponse = new UserResponse();

            it('Should flag sentiments containing "x" as being negative', function () {
                expect(userResponse.containsNegativeSentiment(['x', 'p', 'p', 'm'])).toBeTruthy();
            });

            it('Should flag sentiments containing "y" as being negative', function () {
                expect(userResponse.containsNegativeSentiment(['y', 'p', 'p', 'm'])).toBeTruthy();
            });

            it('Should flag sentiments containing "n" as being negative', function () {
                expect(userResponse.containsNegativeSentiment(['n', 'p', 'p', 'm'])).toBeTruthy();
            });

            it('Should return false when there is no negative sentiment', function () {
                expect(userResponse.containsNegativeSentiment(['m', 'p', 'p', 'm'])).toBeFalsy();
            });
        });

        describe('getSentiment', function () {
            it('Should return the correct sentiment for a user response option', function () {
                var userResponse = new UserResponse();
                _.each(sentimentsData, function (responseSentiments, userResponseString) {
                    expect(_.isEqual(userResponse.getSentiment(userResponseString), responseSentiments)).toBeTruthy();
                    expect(userResponse.getSentiment(userResponseString)).toEqual(responseSentiments);
                })
            });
        });

        describe('getPositiveResponseList', function () {
            var userResponse = new UserResponse();

            it('Should return an array of matched responses only where only a single match is identified', function () {
                expect(userResponse.getPositiveResponseList([false, false, true, false, false])).toEqual(['response3']);
            });

            it('Should return an array of matched responses only where multiple matches identified', function () {
                expect(userResponse.getPositiveResponseList([false, true, false, false, true])).toEqual(['response2', 'response5']);
            });
        });

        describe('getResponse', function () {
            var userResponse = new UserResponse();
            it('Should return a string value of the matched response for permutations resulting in a single match', function () {
                _.each(singleMatchData, function (response, userResponseString) {
                    expect(userResponse.getResponse(userResponseString)).toEqual(response.outcome);
                });
            });

            it('Should find match for permutation that matches a single response based on sentiment pattern of user response', function () {
                _.each(singleMatchBySentiment, function (response, userResponseString) {
                    expect(userResponse.getResponse(userResponseString)).toEqual(response.outcome);
                });
            });

            it('Should find a response match where the response is matched by both matrix and sentiment patterns of user response', function () {
                _.each(singleMatchByIntersection, function (response, userResponseString) {
                    expect(userResponse.getResponse(userResponseString)).toEqual(response.outcome);
                });
            });

            it('Should return response 10 for the following permutations', function () {
                var testData = ['aaaaaaaaa','aaaaaaaab','aaaaaaaac','aaaaaaaad','aaaaaaaba','aaaaaaabb','aaaaaaabc','aaaaaaabd','aaaaaaaca','aaaaaaacb','aaaaaaacc','aaaaaaacd','aaaaaaada','aaaaaaadb','aaaaaaadc','aaaaaaadd','aaaaabaa','aaaaaabab','aaaaaabac','aaaaaabad','aaaaaabba','aaaaaabbb','aaaaaabbc','aaaaaabbd','aaaaaabca','aaaaaabcb','aaaaaabcc','aaaaaabcd','aaaaaabda','aaaaaabdb', 'acbccccca'];
                _.each(testData, function (userResponseString) {
                    expect(userResponse.getResponse(userResponseString)).toEqual('response10');
                });
            });

            it('Should return response 1 for the following user permutations', function () {
                _.each(['dcdddcccd','dcddddccd','dcdddcdcd','dcdddddcd','dcdddcccc','dcddddccc','dcdddcdcc','dcdddddcc'], function (userResponseString) {
                    expect(userResponse.getResponse(userResponseString)).toEqual('response1');
                });
            });

            it('Should return response 7 for the following user permutations', function () {
                _.each(['ccdddcccc','ccdddcdcc','ccdddcccd','ccdddcdcd','ccddddccc','ccdddddcc','ccddddccd','ccdddddcd','acdddcccc','acdddcdcc','acdddcccd','acdddcdcd','acddddccc','acdddddcc','acddddccd','acdddddcd','bcdddcccc','bcdddcdcc','bcdddcccd','bcdddcdcd','bcddddccc','bcdddddcc','bcddddccd','bcdddddcd'], function (userResponseString) {
                    expect(userResponse.getResponse(userResponseString)).toEqual('response7');
                });
            });

            it('Should return response 12 for the following user permutations', function () {
                _.each(['acbbcdcbd', 'acbbddcbd', 'accbcdcbd', 'accbddcbd', 'bcbbcdcbd', 'bcbbddcbd', 'bccbcdcbd', 'bccbddcbd', 'ccbbcdcbd', 'ccbbddcbd', 'cccbcdcbd', 'cccbddcbd'], function (userResponseString) {
                    expect(userResponse.getResponse(userResponseString)).toEqual('response12');
                });
            });


            it('Should return response 2 for permutations with 1 negative response only at question 3', function () {
                _.each(['acabcccbc', 'bcaddddcd', 'ccabcdcbc'], function (userResponseString) {
                    expect(userResponse.getResponse(userResponseString)).toEqual('response2');
                });
            });

            it('Should return response 12 for permutation with 1 mildly positive (q3c)', function () {
                expect(userResponse.getResponse('cccddddcc')).toEqual('response12');
            })

        });

    });

});