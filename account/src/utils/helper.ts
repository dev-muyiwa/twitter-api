import {maskEmail2, maskPhone} from "maskdata";

const maskEmail = (email: string): string => {
    return maskEmail2(email, {
        maskWith: "*",
        unmaskedStartCharactersBeforeAt: 4,
        unmaskedEndCharactersAfterAt: 4
    })
}

const maskMobile = (mobile: string): string => {
    return maskPhone(mobile, {
        maskWith: "*",
        unmaskedStartDigits: 4,
        unmaskedEndDigits: 4
    })
}

export {maskEmail, maskMobile}