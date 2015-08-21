define(['lib/news_special/bootstrap'], function (news) {

	return function (response) {
		//get the share message from displayed response
		var shareMsg = news.$('#' + news.eq + response).data('share');
		var imageElementToBeShared = news.$('#' + news.eq + response).find('.' + news.eq + 'lazy')[0];
		var shareImgPath = news.$(imageElementToBeShared).data('lazy');
		
		function updateShareTools(shareMsg, shareImgPath) {
			news.pubsub.emit('ns:' + news.eq + 'sharetools:share:message', shareMsg);
			news.pubsub.emit('ns:' + news.eq + 'sharetools:share:image', shareImgPath);
		}
		
		news.$('.' + news.eq + 'result--btns').show();
		news.$('#' + news.eq + response).show();
		updateShareTools(shareMsg, shareImgPath);

		return news.$('#' + news.eq + response);
	};
});
