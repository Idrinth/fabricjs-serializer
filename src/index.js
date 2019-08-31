/**/
class FabricJsSerializer
{
	constructor()
	{
		this.types = {
			'': {
				factory: fabric.ActiveSelection
			}
		};
		this.ordered = [];
	}
	register(/* string */ type, /* Function */ factory)
	{
		this.types[type] = {factory};
		this.ordered.push(type);
	}
	fromJson(/* string */ json, /* fabricjs.Canvas */ canvas)
	{
		const data = JSON.parse(json);
		for (const el of canvas._objects) {
			canvas.remove(el);
		}
		const self = this;
		data.objects.sort((a, b) => {
			return self.ordered.indexOf(a.type) - self.ordered.indexOf(a.type);
		});
		for (const el of data.objects) {
			if (this.types.hasOwnProperty(el.type)) {
				canvas.add(this.types[el.type].factory(el));
			}
		}
	}
	toJson(/* fabricjs.Canvas */ canvas)
	{
		return JSON.stringify({
			version: canvas.version,
			objects: canvas._objects.map(object => {
				const prev = object.includeDefaultValues;
				object.includeDefaultValues = false;
				const data object.toObject();
				object.includeDefaultValues = prev;
				return data;
			}
		});
	}
}