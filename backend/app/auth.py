import os
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv

load_dotenv()

# We use the provided Neon Auth URL to fetch the JWKS
NEON_AUTH_URL = os.getenv("NEON_AUTH_URL", "https://ep-royal-sound-b37l2mgc.neonauth.c-4.ap-southeast-1.aws.neon.tech/neondb/auth")
JWKS_URL = f"{NEON_AUTH_URL}/.well-known/jwks.json"

# PyJWKClient automatically fetches and caches the public keys
jwks_client = PyJWKClient(JWKS_URL)

# We no longer need our custom login endpoint because Neon Auth handles it.
# We just use this scheme to extract the Bearer token from the header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception

    try:
        # Get the signing key from the JWKS based on the token's header
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Decode the token using the public key
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "ES256"],
            # If audience checking is required by Neon, we'd add audience="our-audience"
            options={"verify_aud": False} 
        )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        # Return a dictionary (or an object) representing the user
        return {"id": user_id, "email": payload.get("email")}
        
    except Exception as e:
        # Catch any PyJWT error (ExpiredSignatureError, InvalidTokenError, etc)
        print(f"JWT Verification failed: {e}")
        raise credentials_exception
