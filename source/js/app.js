define(['lib/news_special/bootstrap', 'user_response_model', 'quiz_view', 'result_view', 'lib/news_special/share_tools/controller'], function (news, UserResponse, QuizView, ResultView, ShareTools) {

    news.eq = 'entrepreneur_quiz__';
    news.sendMessageToremoveLoadingImage();

    news.lazyLoadImage = function (imageElem) {
        imageElem.src = news.$(imageElem).data('lazy');
    };

    news.changeSlide = function (currentSlide, nextSlide) {
        news.$(currentSlide).hide();
        news.$(nextSlide).show();
    };
    
    return function () {
        var quizView = new QuizView();
        var userResponse = new UserResponse();
        var responseVal = '';

        function attachEventsToStartAndRestartBtns() {
            news.$('#' + news.eq + 'start_btn').on('click', function () {
                startQuiz();
            });

            news.$('.' + news.eq + 'restart_btn--container').off();   //removes the earlier event attached to this button
            news.$('.' + news.eq + 'restart_btn--container').on('click', function () {
                resetQuiz();
                startQuiz();
            });
        }

        function prepareSharetools() {
            new ShareTools(
                '.tempShareToolsHolder',
                {
                    storyPageUrl: document.referrer,
                    header:       news.$('#' + news.eq + 'sharetools--container').data('share-header'),
                    hashtag:      'BBCbizquiz',
                    template:     'dropdown' // 'default' or 'dropdown'
                },
                'entrepreneur_quiz__sharetools'
            );
        }

        function startQuiz() {
            news.pubsub.emit('istats', ['quiz-start', 'newsspec-interaction', true]);
            news.changeSlide(news.$('#' + news.eq + 'start'), news.$('#' + news.eq + 'slide--q1'));
            news.$('#' + news.eq + 'goto--result').off();   //removes the earlier event attached to this button
            news.$('#' + news.eq + 'goto--result').on('click', function (e) {
                resultViewHandler(e);
            });
        }

        function resultViewHandler(e) {
            news.pubsub.emit('istats', ['quiz-end', 'newsspec-interaction', true]);

            responseVal = userResponse.getResponse(quizView.selectedOptionsStr);
            var currentSlide = news.$('#' + news.eq + 'slide--q9');
            var nextSlide = new ResultView(responseVal);

            news.lazyLoadImage(news.$(nextSlide).find('.' + news.eq + 'lazy')[0]);

            news.changeSlide(currentSlide, nextSlide);

            news.pubsub.emit('istats', [responseVal, 'newsspec-interaction', true]);
        }

        function resetQuiz() {
            news.pubsub.emit('istats', ['quiz-restart', 'newsspec-interaction', true]);

            news.changeSlide(news.$('#' + news.eq + 'response'), news.$('#' + news.eq + 'slide--q1'));

            //reseeting the form removes "selected" attribute on previously selected options
            document.getElementById('' + news.eq + 'form').reset();

            news.$('#' + news.eq + responseVal).hide();
            news.$('.' + news.eq + 'infoboxes').hide(); //hide infoboxes attached to each question
            news.$('.' + news.eq + 'btn--next').hide();
            news.$('.' + news.eq + 'result--btns').hide();
        }

        this.init = function () {
            prepareSharetools();
            attachEventsToStartAndRestartBtns();
        };
    };
});