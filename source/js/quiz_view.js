define(['lib/news_special/bootstrap'], function (news) {

	return function () {
		var quizView = this;
		var selectedOptions = [];
		var questionNumber;
		var currentSlide;
		var nextSlide;
		
		function getQuestionNumber(elemId) {
			return Number(elemId.split('--q')[1][0]);
		}

		function getSelectedOption(elemId) {
			return elemId.split('--q')[1][1];
		}

		function getCurrentSlideFromNextBtn(nxtbtn) {
			var nxtQuestionNumber = Number(nxtbtn.id.split('goto--q')[1]);
			var currentQuestionNumber = nxtQuestionNumber - 1;
			return '#' + news.eq + 'slide--q' + currentQuestionNumber;
		}

		function getNextSlideFromNextBtn(nxtbtn) {
			return news.$('#' + nxtbtn.id.split('goto--').join('slide--'));
		}

		function optionSelectionHandler(e) {
			questionNumber = getQuestionNumber(e.target.id);

			selectedOptions[questionNumber - 1] = getSelectedOption(e.target.id);
			quizView.selectedOptionsStr = selectedOptions.join('');

			news.$('.' + news.eq + 'options').removeClass('' + news.eq + 'option--selected');
			news.$('.' + news.eq + 'infoboxes').show(); //show infobox
			news.$('.' + news.eq + 'btn--next').show();
			news.$(this).parent().addClass('' + news.eq + 'option--selected');
		}

		function nextButtonHandler(e) {
			currentSlide = news.$(getCurrentSlideFromNextBtn(e.target));
			nextSlide = getNextSlideFromNextBtn(e.target);

			news.changeSlide(currentSlide, nextSlide);

			news.$('.' + news.eq + 'infoboxes').hide(); //hide info
			news.$('.' + news.eq + 'btn--next').hide();
			return false;
		}

		news.$('.' + news.eq + 'option').off(); //removes the earlier selection event
		news.$('.' + news.eq + 'option').on('click', optionSelectionHandler);

		news.$('.' + news.eq + 'btn--next').off();	//removes the earlier event attached to the next button
		news.$('.' + news.eq + 'btn--next').on('click', nextButtonHandler);
	};
});