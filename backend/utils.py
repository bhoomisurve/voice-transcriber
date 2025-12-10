import re

FILLERS = [
    "um", "uh", "like", "you know", "basically", "literally",
    "hmm", "so", "actually", "kind of", "sort of", "i mean",
    "you see", "well", "right", "okay", "alright"
]

def clean_text(text: str) -> str:
    """
    Clean transcribed text by removing filler words and improving formatting
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Convert to lowercase for processing
    new_text = text.lower()
    
    # Remove filler words (with word boundaries)
    for filler in FILLERS:
        # Match filler words as standalone words
        new_text = re.sub(rf"\b{re.escape(filler)}\b", "", new_text, flags=re.IGNORECASE)
    
    # Remove excessive punctuation
    new_text = re.sub(r'[,]{2,}', ',', new_text)
    new_text = re.sub(r'[.]{2,}', '.', new_text)
    
    # Remove multiple spaces
    new_text = re.sub(r'\s+', ' ', new_text).strip()
    
    # Remove spaces before punctuation
    new_text = re.sub(r'\s+([.,!?;:])', r'\1', new_text)
    
    # Capitalize first letter of sentences
    sentences = re.split(r'([.!?]+\s*)', new_text)
    capitalized = []
    
    for i, part in enumerate(sentences):
        if part.strip() and not re.match(r'^[.!?]+\s*$', part):
            capitalized.append(part[0].upper() + part[1:] if len(part) > 0 else part)
        else:
            capitalized.append(part)
    
    new_text = ''.join(capitalized)
    
    # Ensure first character is capitalized
    if new_text and len(new_text) > 0:
        new_text = new_text[0].upper() + new_text[1:]
    
    return new_text