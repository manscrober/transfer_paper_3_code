export default class Error {
	public message: string;
	public status: number;

	constructor(message: string) {
		this.message = message;
	}
}
