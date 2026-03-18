import Joi from "joi";

export const createTaskValidator = Joi.object({
  memberId: Joi.string().uuid().required(),

//   function: Joi.string()
//     .min(2)
//     .max(100)
//     .required(),
notes:Joi.string(),
  performanceDate: Joi.date().required(),

  role: Joi.string()
    .valid("RESPNSORIAL_PASALM", "COMMUNION_SOLO")
    .required()
});