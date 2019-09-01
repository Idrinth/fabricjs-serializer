/* global fabric */
class FabricJsSerializer
{
	constructor()
	{
		this.types = {
			'': {
				factory: fabric.ActiveSelection
			}
		};
	}
	register(/* string */ type, /* Function */ factory, /* string */...dependencies)
	{
		this.types[type] = {factory, dependencies};
		this.ordered.push(type);
	}
	fromJson(/* string */ json, /* fabric.Canvas */ canvas)
	{
		const data = JSON.parse(json);
                const drawOnChange = canvas.renderOnAddRemove;
                canvas.renderOnAddRemove = false;
		for (const el of canvas._objects) {
			canvas.remove(el);
		}
		const self = this;
                const isRequiredBy = (/* string */ requirer, /* string */ dependency) => {
                    return self.types[requirer].dependencies.includes(dependency);
                };
		data.objects.sort((/* fabric.Object */ a, /* fabric.Object */ b) => {
			return isRequiredBy(a.type, b.type) ? 1 : (isRequiredBy(b.type, a.type) ? -1 :0);
		});
		for (const el of data.objects) {
			if (this.types.hasOwnProperty(el.type)) {
                            canvas.add(this.types[el.type].factory(el));
			}
		}
                canvas.renderOnAddRemove = drawOnChange;
                canvas.renderAll();
	}
	toJson(/* fabric.Canvas */ canvas)
	{
		return JSON.stringify({
			version: fabric.version,
			objects: canvas._objects.map(object => {
				const prev = object.includeDefaultValues;
				object.includeDefaultValues = false;
				const data = object.toObject();
				object.includeDefaultValues = prev;
				return data;
			})
		});
	}
}