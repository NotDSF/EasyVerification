# EasyVerification
Captcha-free verification, simple and easy.

## How does this work?
EasyVerification utilises Cloudflare's **Managed Challenge** which attempts to not use captchas at all. [(More Info Here)](https://blog.cloudflare.com/end-cloudflare-captcha/)\
This makes the verification proccess a lot more easier, did you know **67% of people will permanently abandon a captcha** after encountering a single failure. 

## Configure Bot
Add an .env file to the main directory of the bot and use this template to help you.
```
DATABASE_URL=""
TOKEN=""
SALT=""
APPLICATION_ID=""
```

## Add this to your own server
You can invite this to your own server by using this link: [Invite](https://easyverify.tech/invite)