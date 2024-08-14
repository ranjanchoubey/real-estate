import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi import FastAPI


app = FastAPI(
    title="Real Estate API",
    description="This is a very custom OpenAPI schema for the Real Estate API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

origins = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/real-estate/")
def home():
    return {"message": "Hello Hunny Bunny Tokko Tokko!! Feeling Something Something ...."}


@app.get("/real-estate/api/insights")
async def insights():
    print("insights api called....")
    insights_data = 123
    result_dict = {'message': 'Prediction Successful !', 'data': insights_data}
    print("RESPONSE SENT: ", result_dict)
    return result_dict


@app.post("/real-estate/api/predictions", status_code=status.HTTP_201_CREATED)
async def predictions(request: Request):
    print("predictions api called...")
    form_data = await request.json()
    data = form_data
    print("prediction result: ", data)
    return JSONResponse(status_code=status.HTTP_200_OK, content=data)


if __name__ == "__main__":
    uvicorn.run("app:app", host='0.0.0.0', port=7878, log_level="debug")

