import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";

const { slug } = getPathParts("productivity", "Log");

export const LogFields = {
  id: { field: "ID" },
  task: { field: "CascadeRequiredForeignKey", fk: "Task" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(LogFields);

export class Log extends MyModel(slug, props) {}
export class LogStore extends MyStore(Log, BASE_URL, slug) {}
export type LogInterface = PropsToInterface<typeof props>;
