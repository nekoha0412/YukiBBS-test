@app.get("/verify", response_class=HTMLResponse)
def get_form(seed=""):
    return requests.get(fr"{url}verify?seed={urllib.parse.quote(seed)}").text

@app.post("/submit", response_class=HTMLResponse)
def submit(h_captcha_response: str = Form(alias="h-captcha-response"), seed: str = Form(...)):
    return requests.post(fr"{url}submit",data={"h-captcha-response": h_captcha_response, "seed": seed}).text