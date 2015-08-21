setwd("~/Sites/bbc/news/special/2015/newsspec_11329/source/data")
library(rjson)
library(sqldf)
library(reshape2)

quiz_permutations <- read.csv('user_response_permutations.csv', header=F)
colnames(quiz_permutations) <- 'permutation'
head(quiz_permutations)
nrow(quiz_permutations)

quiz_permutations$R1 <- grepl('^dcd{3,}[cd]{2,}c[cd]$', quiz_permutations$permutation)
quiz_permutations$R2 <- grepl('^[abcd]{2,}a[abcd]{6,}$', quiz_permutations$permutation)
quiz_permutations$R3 <- grepl('^[abcd]{6,}b[abcd]{2}$|^[abcd]{3,}c[abcd]{5,}$', quiz_permutations$permutation)
quiz_permutations$R4 <- grepl('^[abcd][a|b][abcd]{7,}$', quiz_permutations$permutation)
quiz_permutations$R5 <- grepl('^[abcd]{7,}d[abcd]$', quiz_permutations$permutation)
quiz_permutations$R6 <- grepl('^[abcd]{4,}[ab][abcd]{4,}$', quiz_permutations$permutation)
quiz_permutations$R7 <- grepl('^[abc]cd{3,}[cd]{2,}c[cd]$', quiz_permutations$permutation)
quiz_permutations$R8 <- grepl('^[abcd]{5,}[ab][abcd]{3,}$|^[abcd]{6,}a[abcd]{2,}$|^[abcd]{5,}[ab]a[abcd]{2,}$|^[abcd]{8,}b$|^[abcd]{5,}[ab]a[abcd]b$|[abcd]{5,}[ab][abcd]{2,}b', quiz_permutations$permutation)
quiz_permutations$R9 <- grepl('^[abcd]{3,}a[abcd]{4,}a$|^[abcd]{3,}a[abcd]{5,}$|^[abcd]{8,}a$', quiz_permutations$permutation)
# quiz_permutations$R10 <- grepl('^[abcd][ab]a[abcd]a{2,}[abcd]{3,}$|^[abcd]{3,}a[abcd]{3,}a{2,}$', quiz_permutations$permutation)
quiz_permutations$R10 <- grepl('^[abc]a[ac][ab]{3,}[ad][ab][abcd]$', quiz_permutations$permutation)
quiz_permutations$R11 <- grepl('^[abcd]d[abcd]{7,}$', quiz_permutations$permutation)
quiz_permutations$R12 <- grepl('^[abc][abcd][bc]b[cd][abcd]{2,}b[abcd]$', quiz_permutations$permutation)
quiz_permutations$R13 <- grepl('[abcd]{7,}a[abcd]$', quiz_permutations$permutation)

# extract a dataset for test size 100
sampleData <- quiz_permutations[sample(1:nrow(quiz_permutations), 100, replace=FALSE),]
head(sampleData)
colnames(sampleData) <- NULL
rownames(sampleData) <- sampleData[,1]
sampleData <- sampleData[,-1]

sampleJson <- toJSON(as.data.frame(t(sampleData)))
sampleJson
write(paste('define(', sampleJson, ');', sep=''), '../js/spec/data/testFixture.js')


allResponses <- melt(quiz_permutations, id.vars=c('permutation'))

responsesRaised <- allResponses[ allResponses$value == TRUE,]

noResponseRaised <- sqldf('SELECT * FROM quiz_permutations WHERE permutation NOT IN(SELECT DISTINCT permutation FROM responsesRaised)')
nrow(noResponseRaised) # 688 Have no response raised initially

groupedResponses <- sqldf('SELECT permutation, count(*) AS total FROM responsesRaised GROUP BY permutation')

sResponses <- sqldf('SELECT * FROM responsesRaised WHERE permutation IN(SELECT permutation FROM groupedResponses WHERE total = 1)')
nrow(sResponses) # 8304 single responses

multipleResponses <- sqldf('SELECT * FROM responsesRaised WHERE permutation IN(SELECT permutation FROM groupedResponses WHERE total > 1)')
length(unique(multipleResponses$permutation)) # 253152

# TREATMENT OF SINGLE RESPONSE PERMUTATIONS
singleResponseDistribution <- sqldf('SELECT variable, count(*) AS total FROM sResponses GROUP BY variable')
singleResponseDistribution

exportFixtureData <- function (testData, filename) {
    sampleJson <- toJSON(as.data.frame(t(sampleData)))
    print(toJSON(as.data.frame(t(head(sampleData)))))
    write(paste('define(', sampleJson, ');', sep=''), paste('../js/spec/data/', filename, '.js', sep=''))
}

# WRITE OUT TEST DATA FOR SINGLE RESPONSES
sResponses$value <- NULL
sResponses$variable <- gsub('R','response', sResponses$variable)
rownames(sResponses) <- sResponses[,1]
sResponses$i <- 0
sResponses$permutation <- NULL
colnames(sResponses) <- c('outcome', 'i')
singleMatchJson <- toJSON(as.data.frame(t(sResponses[1:100,])))
singleMatchJson
write(paste('define(', singleMatchJson, ');', sep=''), '../js/spec/data/singleMatchFixture.js')

# EXTRACT MULTIPLE OR NONE MATCHES
mResponses <- sqldf('SELECT * FROM quiz_permutations WHERE permutation IN(SELECT DISTINCT permutation FROM multipleResponses)')

# question sentiments
q1 <- c('p', 'p', 'p', 'p')
q2 <- c('x', 'x', 'p', 'y')
q3 <- c('n', 'm', 'm', 'p')
q4 <- c('x', 'm', 'y', 'p')
q5 <- c('n', 'n', 'm', 'p')
q6 <- c('n', 'n', 'p', 'p')
q7 <- c('x', 'y', 'p', 'p')
q8 <- c('x', 'm', 'p', 'y')
q9 <- c('x', 'y', 'p', 'p')

sentiments <- t(data.frame(q1, q2, q3, q4, q5, q6, q7, q8, q9))
rm(q1, q2, q3, q4, q5, q6, q7, q8, q9)
colnames(sentiments) <- c('a', 'b', 'c', 'd')

head(sentiments,10)

mResponses$q1 <- sentiments[1,substr(mResponses$permutation, 1, 1)]
mResponses$q2 <- sentiments[2,substr(mResponses$permutation, 2, 2)]
mResponses$q3 <- sentiments[3,substr(mResponses$permutation, 3, 3)]
mResponses$q4 <- sentiments[4,substr(mResponses$permutation, 4, 4)]
mResponses$q5 <- sentiments[5,substr(mResponses$permutation, 5, 5)]
mResponses$q6 <- sentiments[6,substr(mResponses$permutation, 6, 6)]
mResponses$q7 <- sentiments[7,substr(mResponses$permutation, 7, 7)]
mResponses$q8 <- sentiments[8,substr(mResponses$permutation, 8, 8)]
mResponses$q9 <- sentiments[9,substr(mResponses$permutation, 9, 9)]

head(mResponses,10)

sentimentMatrix <- mResponses[,c('permutation', paste('q', 1:9, sep=''))]
rownames(sentimentMatrix) <- sentimentMatrix[,1]
sentimentMatrix <- sentimentMatrix[,-1]
head(sentimentMatrix)

sampleData <- sentimentMatrix[sample(1:nrow(sentimentMatrix), 100, replace=FALSE),]
colnames(sampleData) <- NULL
sampleData <- as.data.frame(t(sampleData))
head(sampleData)
sampleJson <- toJSON(sampleData)
sampleJson
write(paste('define(', sampleJson, ');', sep=''), '../js/spec/data/sentimentsFixture.js')

sentimentMatrix$permutation <- rownames(sentimentMatrix)

sentimentMatrix$cn <- apply(sentimentMatrix, 1, function (x) length(x[x=='n']))
sentimentMatrix$cx <- apply(sentimentMatrix, 1, function (x) length(x[x=='x']))
sentimentMatrix$cy <- apply(sentimentMatrix, 1, function (x) length(x[x=='y']))
sentimentMatrix$cm <- apply(sentimentMatrix, 1, function (x) length(x[x=='m']))
sentimentMatrix$cp <- apply(sentimentMatrix, 1, function (x) length(x[x=='p']))

head(sentimentMatrix)

head(mResponses)
sentimentMatrix <- sentimentMatrix[,c('permutation', 'cn', 'cm', 'cp', 'cx', 'cy')]
rownames(sentimentMatrix) <- NULL

mResponses <- merge(mResponses, sentimentMatrix, by.x='permutation', by.y='permutation')

nrow(mResponses)

head(mResponses)

# HANDLE NEGATIVE RESPONSES
negativeResponses <- mResponses[mResponses$cn > 0 | mResponses$cx > 0 | mResponses$cy > 0,]

negativeResponses$sentiment <- paste(negativeResponses$q1, negativeResponses$q2, negativeResponses$q3, negativeResponses$q4, negativeResponses$q5, negativeResponses$q6, negativeResponses$q7, negativeResponses$q8, negativeResponses$q9, sep='')

negativeResponses <- negativeResponses[,c('permutation', 'sentiment')]

negativeResponses$response2 <- grepl('^[^nxy]{2,}n[^nxy]{6,}$', negativeResponses$sentiment)
negativeResponses$response3 <- grepl('^[^nxy]{6,}y[^nxy]{2,}$|^[^nxy]{3,}y[^nxy]{5,}$|^[^nxy]{3,}y[^nxy]{2,}y[^nxy]{2,}$', negativeResponses$sentiment)
negativeResponses$response4 <- grepl('^[^nxy]x[^nxy]{7,}$', negativeResponses$sentiment)
negativeResponses$response5 <- grepl('^[^nxy]{7,}y[^nxy]$', negativeResponses$sentiment)
negativeResponses$response6 <- grepl('^[^nxy]{4,}n[^nxy]{4,}$', negativeResponses$sentiment)
negativeResponses$response8 <- grepl('^[^nxy]{5,}n[^nxy]{3,}$|^[^nxy]{6,}x[^nxy]{2,}$|^[^nxy]{5,}nx[^nxy]{2,}$|^[^nxy]{8,}y$|^[^nxy]{5,}nx[^nxy]y$|^[^nxy]{6,}x[^nxy]y$|^[^nxy]{5,}n[^nxy]{2,}y$|^[^nxy]{5,}n[^nxy]{2,}y$', negativeResponses$sentiment)
negativeResponses$response9 <- grepl('^[^nxy]{3,}x[^nxy]{4,}x$|^[^nxy]{3,}x[^nxy]{5,}$|^[^nxy]{8,}x$', negativeResponses$sentiment)
negativeResponses$response11 <- grepl('^[^nxy]y[^nxy]{7,}$', negativeResponses$sentiment)
negativeResponses$response13 <- grepl('^[^nxy]{7,}x[^nxy]$', negativeResponses$sentiment)


nrow(negativeResponses)

head(negativeResponses)

response10 <- negativeResponses[ negativeResponses$response2 == FALSE & negativeResponses$response3 == FALSE & negativeResponses$response4 == FALSE & negativeResponses$response5 == FALSE & negativeResponses$response6 == FALSE & negativeResponses$response8 == FALSE & negativeResponses$response9 == FALSE & negativeResponses$response11 == FALSE & negativeResponses$response13 == FALSE,]
nrow(response10) #252672
head(response10, 30)

# EXPORT RESPONSE 10 FIXTURE DATA

head(negativeResponses)

sentimentResponses <- negativeResponses[,-2]
sentimentResponses <- melt(sentimentResponses, id.vars=c('permutation'))    
colnames(sentimentResponses) <- c('permutation', 'outcome', 'value')

sentimentResponses <- sentimentResponses[ sentimentResponses$value == TRUE,]

head(sentimentResponses)

singleResponseSentimentDistribution <- sqldf('select outcome, count(*) as total from sentimentResponses group by outcome')

singleResponseSentimentDistribution


singleSentimentMatches <- sqldf('select * from sentimentResponses where permutation in(select permutation from sentimentResponses group by permutation having count(*) = 1)')
nrow(singleSentimentMatches)

sampleData <- singleSentimentMatches[sample(1:nrow(singleSentimentMatches), 100, replace=FALSE),]
head(sampleData)
rownames(sampleData) <- sampleData[,1]
sampleData <- sampleData[,-1]
# colnames(sampleData) <- NULL
sampleData <- as.data.frame(t(sampleData))
head(sampleData)
sampleJson <- toJSON(sampleData)
sampleJson
write(paste('define(', sampleJson, ');', sep=''), '../js/spec/data/singleMatchBySentimentFixture.js') 

multipleSentimentMatches <- sqldf('select * from sentimentResponses where permutation in(select permutation from sentimentResponses group by permutation having count(*) > 1)')


head(multipleSentimentMatches)

head(noResponseRaised)
noResponseRaised$q1 <- sentiments[1,substr(noResponseRaised$permutation, 1, 1)]
noResponseRaised$q2 <- sentiments[2,substr(noResponseRaised$permutation, 2, 2)]
noResponseRaised$q3 <- sentiments[3,substr(noResponseRaised$permutation, 3, 3)]
noResponseRaised$q4 <- sentiments[4,substr(noResponseRaised$permutation, 4, 4)]
noResponseRaised$q5 <- sentiments[5,substr(noResponseRaised$permutation, 5, 5)]
noResponseRaised$q6 <- sentiments[6,substr(noResponseRaised$permutation, 6, 6)]
noResponseRaised$q7 <- sentiments[7,substr(noResponseRaised$permutation, 7, 7)]
noResponseRaised$q8 <- sentiments[8,substr(noResponseRaised$permutation, 8, 8)]
noResponseRaised$q9 <- sentiments[9,substr(noResponseRaised$permutation, 9, 9)]

sqldf('select count(*) from noResponseRaised where q1 = "p" and q2 = "p" and q3 = "p" and q4 = "p" and q5 = "p" and q6 = "p" and q7 = "p" and q8 = "p" and q9 = "p"')

# 
# colnames(multipleResponses) <- c('permutation', 'outcome', 'value')
# multipleResponses$outcome <- gsub('R', 'response', multipleResponses$outcome)
# 
# head(multipleSentimentMatches)
# head(multipleResponses)
# 
# intersectOfMatchAndSentimentMatch <- sqldf('select b.permutation, b.outcome from multipleResponses a, multipleSentimentMatches b where a.permutation = b.permutation and a.outcome = b.outcome')
# 
# sampleData <- intersectOfMatchAndSentimentMatch[sample(1:nrow(intersectOfMatchAndSentimentMatch), 150, replace=FALSE),]
# head(sampleData)
# sampleData$i <- 0
# rownames(sampleData) <- sampleData[,1]
# sampleData <- sampleData[,-1]
# sampleData <- as.data.frame(t(sampleData))
# head(sampleData)
# sampleJson <- toJSON(sampleData)
# sampleJson
# write(paste('define(', sampleJson, ');', sep=''), '../js/spec/data/singleMatchByIntersectionFixture.js') 
# 
# 
# 
# 
# 
# positiveSentiments <- mResponses[mResponses$cn == 0,]
# positiveSentiments$R10 <- grepl('^[abc]a[ac][ab]{3,}[ad][ab][abcd]$', positiveSentiments$permutation)
# 
# 
# nrow(positiveSentiments[ positiveSentiments$R10 == TRUE, ])
# 
# 
# 
# head(positiveSentiments)
# 
# nrow(positiveSentiments)
# 
# 
# # 
# # quiz_permutations.matrix[quiz_permutations.matrix==FALSE] <- 0
# # quiz_permutations.matrix[quiz_permutations.matrix==TRUE] <- 1
# # # alternative solution
# # # as.data.frame(lapply(quiz_permutations.numeric, function(x){replace(x, x==0,'false'); replace(x,x==1,'true')}))
