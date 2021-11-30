const AWS = require('aws-sdk');
const axios = require('axios');
const ce = new AWS.CostExplorer({region: 'us-east-1'});

exports.handler = async (event) => {
  
    // 昨日と今日のDateインスタンスを作成
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // YYYY-MM-DD形式でstartとendを作成
    const start = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
    const end = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
    

    // CEに投げるパラメータ
    const params = {
      Granularity: 'DAILY',
      TimePeriod: {
        Start: start,
        End: end,
      },
      Metrics: ['UnblendedCost'],
      GroupBy: [{
        Type: 'DIMENSION',
        Key: 'SERVICE',
      }],
    };
    
    // コストデータの結果格納用
    let costResult = [];
    // CEからコストデータを取得
    const cost = await ce.getCostAndUsage(params).promise();
    // 取得した結果をresultに格納していく
    cost?.ResultsByTime?.forEach((c) => {
      //console.log(c);
      c?.Groups?.forEach((g) => {
        if(g?.Metrics?.UnblendedCost?.Amount !== '0') {
          costResult.push({
            key: g?.Keys?.[0] ?? 'Any Service',
            amount: g?.Metrics?.UnblendedCost?.Amount
          })
        }
      })
    });
    
    // Slack投稿用の本文を作成
    let markdown = `*_AWS Billing_* (${start}) \r\n`;
    // resultには各リソースごとの名称と金額が入っているのでリスト形式で出力
    costResult.forEach((r) => {
      markdown += `* ${r.key} : $${r.amount} \r\n`
    });
    
    // Slackに投稿
    const res = await axios.post("https://slack.com/api/chat.postMessage", {
      channel: process.env.SLACK_CHANNEL_ID,
      mrkdwn: true,
      text: markdown
    }, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Bearer " + process.env.SLACK_TOKEN
      }
    });

    const response = {
        statusCode: 200,
        body: JSON.stringify('Success!'),
    };
    return response;
};
